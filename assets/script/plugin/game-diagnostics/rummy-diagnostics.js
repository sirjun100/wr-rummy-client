/**
 * Android 原生诊断桥接（Cocos JSB）。
 *
 * 在 globalThis 上挂载 __rummyDiagnostics，用于面包屑与错误上报。
 * 通过 jsb.reflection 调用 com.master.rummy.diagnostics.RummyDiagnostics。
 * Web / 编辑器无 jsb 时不执行任何逻辑。
 */
(function installRummyDiagnostics(globalScope) {
    "use strict";

    var JAVA_CLASS = "com/master/rummy/diagnostics/RummyDiagnostics";
    var MAX_REPORT_MESSAGE_LENGTH = 2048;
    var MAX_REPORT_STACK_LENGTH = 60000;
    var MAX_BREADCRUMB_LENGTH = 220;
    var MAX_CONSOLE_ERROR_ARGS = 5;

    if (!globalScope.jsb || globalScope.__rummyDiagnostics) {
        return;
    }

    var reflectionBridge = globalScope.jsb.reflection;

    /**
     * 调用 Android 诊断类的静态方法。
     * 异常会被吞掉，避免遥测影响游戏主流程。
     */
    function callNativeStatic(methodName, jniSignature, jniArgs) {
        try {
            if (!reflectionBridge) {
                return undefined;
            }
            var callArgs = [JAVA_CLASS, methodName, jniSignature].concat(jniArgs);
            return reflectionBridge.callStaticMethod.apply(reflectionBridge, callArgs);
        } catch (_ignored) {
            return undefined;
        }
    }

    var diagnosticsApi = {
        /**
         * 向原生上报 JS 错误（类型 js_error）。
         * @param {string} message 错误摘要
         * @param {string} [stackTrace] 堆栈
         */
        report: function reportError(message, stackTrace) {
            var safeMessage = String(message).slice(0, MAX_REPORT_MESSAGE_LENGTH);
            var safeStack = String(stackTrace || "").slice(0, MAX_REPORT_STACK_LENGTH);
            callNativeStatic(
                "report",
                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                ["js_error", safeMessage, safeStack]
            );
        },

        /**
         * 记录短路径事件，供原生日志串联（如 Socket 生命周期）。
         * @param {string} value 面包屑文本
         */
        breadcrumb: function breadcrumb(value) {
            callNativeStatic("breadcrumb", "(Ljava/lang/String;)V", [
                String(value).slice(0, MAX_BREADCRUMB_LENGTH),
            ]);
        },

        /**
         * 向原生发送 JSON 心跳数据。
         * @param {unknown} payload 可 JSON 序列化的对象
         */
        heartbeat: function heartbeat(payload) {
            callNativeStatic("heartbeat", "(Ljava/lang/String;)V", [JSON.stringify(payload)]);
        },
    };

    globalScope.__rummyDiagnostics = diagnosticsApi;

    var originalConsoleError = console.error;
    var isReportingFromConsoleError = false;

    // 拦截 console.error，将错误同步上报原生
    console.error = function patchedConsoleError() {
        if (!isReportingFromConsoleError) {
            isReportingFromConsoleError = true;
            try {
                var errorArgs = Array.prototype.slice.call(arguments, 0, MAX_CONSOLE_ERROR_ARGS);
                var errorWithStack = errorArgs.find(function (arg) {
                    return arg && typeof arg.stack === "string";
                });
                var messageParts = errorArgs
                    .map(function (arg) {
                        if (typeof arg === "string") {
                            return arg;
                        }
                        if (arg instanceof Error) {
                            return arg.message;
                        }
                        return "";
                    })
                    .filter(Boolean);
                var combinedMessage = messageParts.join(" ");
                var stackTrace = errorWithStack
                    ? errorWithStack.stack
                    : new Error(combinedMessage).stack;
                diagnosticsApi.report(combinedMessage, stackTrace);
            } catch (_ignored) {
                /* 上报失败不影响原有 console.error */
            } finally {
                isReportingFromConsoleError = false;
            }
        }
        return originalConsoleError.apply(console, arguments);
    };

    // 引擎 JS 运行时错误
    globalScope.jsb.onError(function onJsbError(location, message, stack) {
        diagnosticsApi.report(String(message) + " @ " + String(location), stack);
        originalConsoleError.call(console, location, message, stack);
    });

    // 未处理的 Promise 拒绝
    if (typeof globalScope.addEventListener === "function") {
        globalScope.addEventListener("unhandledrejection", function onUnhandledRejection(event) {
            var reason = event.reason;
            var rejectionMessage =
                (reason && reason.message) || "Unhandled promise rejection";
            var rejectionStack =
                (reason && reason.stack) || String(reason);
            diagnosticsApi.report(rejectionMessage, rejectionStack);
        });
    }
})(globalThis);
