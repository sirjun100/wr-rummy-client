/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * LogKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework LogKit
 ****************************************************************************/

// #region LogKit

export enum LogLevel {
    None = 0,
    Exception = 1,
    Error = 2,
    Warning = 3,
    Normal = 4,
    Max = 5,
}

export class LogKit {

    private static mLogLevel: LogLevel = LogLevel.Normal;

    public static get Level(): LogLevel {
        return LogKit.mLogLevel;
    }

    public static set Level(value: LogLevel) {
        LogKit.mLogLevel = value;
    }

    public static I(msg: any, ...args: any[]): void {
        if (LogKit.mLogLevel < LogLevel.Normal) {
            return;
        }
        if (!args || args.length === 0) {
            console.log(msg);
        } else {
            console.log(LogKit.format(msg, args));
        }
    }

    public static W(msg: any, ...args: any[]): void {
        if (LogKit.mLogLevel < LogLevel.Warning) {
            return;
        }
        if (!args || args.length === 0) {
            console.warn(msg);
        } else {
            console.warn(LogKit.format(msg, args));
        }
    }

    public static E(msg: any, ...args: any[]): void {
        if (LogKit.mLogLevel < LogLevel.Error) {
            return;
        }
        if (!args || args.length === 0) {
            console.error(msg);
        } else {
            console.error(LogKit.format(msg, args));
        }
    }

    public static Exception(e: Error): void {
        if (LogKit.mLogLevel < LogLevel.Exception) {
            return;
        }
        console.error(e);
    }

    public static Builder(): string {
        return "";
    }

    private static format(msg: any, args: any[]): string {
        let result = String(msg);
        for (let i = 0; i < args.length; i++) {
            result = result.replace("{" + i + "}", String(args[i]));
        }
        return result;
    }
}

// #endregion

// #region LogKitExtension

export class LogKitExtension {

    public static LogInfo(msg: any): void {
        LogKit.I(msg);
    }

    public static LogWarning(msg: any): void {
        LogKit.W(msg);
    }

    public static LogError(msg: any): void {
        LogKit.E(msg);
    }

    public static LogException(e: Error): void {
        LogKit.Exception(e);
    }
}

// #endregion
