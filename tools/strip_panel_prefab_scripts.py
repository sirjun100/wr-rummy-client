#!/usr/bin/env python3
"""Rename *Panel.prefab -> *Dialog.prefab and strip missing custom script components."""

from __future__ import annotations

import json
import os
import re
import sys
from typing import Any

ASSETS_ROOT = os.path.join(os.path.dirname(__file__), "..", "assets")


def is_custom_script_type(type_name: str | None) -> bool:
    if not type_name or not isinstance(type_name, str):
        return False
    if type_name.startswith("cc."):
        return False
    if "." in type_name:
        return False
    return True


def rename_panel_prefabs(root: str) -> list[tuple[str, str]]:
    renamed: list[tuple[str, str]] = []
    for dirpath, _, files in os.walk(root):
        for name in files:
            if not name.endswith("Panel.prefab"):
                continue
            old = os.path.join(dirpath, name)
            new_name = name.replace("Panel.prefab", "Dialog.prefab")
            new = os.path.join(dirpath, new_name)
            os.rename(old, new)
            renamed.append((old, new))
            meta_old = old + ".meta"
            if os.path.isfile(meta_old):
                os.rename(meta_old, new + ".meta")
    return renamed


def collect_remove_indices(data: list[dict]) -> set[int]:
    remove: set[int] = set()
    for i, obj in enumerate(data):
        if is_custom_script_type(obj.get("__type__")):
            remove.add(i)
            if i + 1 < len(data) and data[i + 1].get("__type__") == "cc.CompPrefabInfo":
                remove.add(i + 1)
    return remove


def fix_refs(obj: Any, remove: set[int], mapping: dict[int, int]) -> Any:
    if isinstance(obj, dict):
        if "__id__" in obj and isinstance(obj["__id__"], int):
            oid = obj["__id__"]
            if oid in remove:
                return None
            obj = dict(obj)
            obj["__id__"] = mapping.get(oid, oid)
            return obj
        out: dict[str, Any] = {}
        for key, val in obj.items():
            if key == "_components" and isinstance(val, list):
                fixed = []
                for item in val:
                    r = fix_refs(item, remove, mapping)
                    if r is not None:
                        fixed.append(r)
                out[key] = fixed
                continue
            if key == "clickEvents" and isinstance(val, list):
                fixed = []
                for item in val:
                    r = fix_refs(item, remove, mapping)
                    if r is not None:
                        fixed.append(r)
                out[key] = fixed
                continue
            r = fix_refs(val, remove, mapping)
            if r is not None:
                out[key] = r
        return out
    if isinstance(obj, list):
        return [x for x in (fix_refs(i, remove, mapping) for i in obj) if x is not None]
    return obj


def rename_panel_names(obj: Any) -> None:
    if isinstance(obj, dict):
        name = obj.get("_name")
        if isinstance(name, str) and name.endswith("Panel"):
            obj["_name"] = name[: -len("Panel")] + "Dialog"
        for v in obj.values():
            rename_panel_names(v)
    elif isinstance(obj, list):
        for item in obj:
            rename_panel_names(item)


def clean_prefab_file(path: str) -> bool:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        return False

    remove = collect_remove_indices(data)
    changed = bool(remove)

    if remove:
        keep = [i for i in range(len(data)) if i not in remove]
        mapping = {old: new for new, old in enumerate(keep)}
        new_data = []
        for i in keep:
            obj = fix_refs(data[i], remove, mapping)
            if obj is not None:
                new_data.append(obj)
        data = new_data

    before = json.dumps(data, ensure_ascii=False)
    rename_panel_names(data)
    after = json.dumps(data, ensure_ascii=False)
    if before != after:
        changed = True

    if not changed:
        return False

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ": "))
        f.write("\n")
    return True


def main() -> int:
    root = os.path.abspath(ASSETS_ROOT)
    if not os.path.isdir(root):
        print("assets root not found", root, file=sys.stderr)
        return 1

    renamed = rename_panel_prefabs(root)
    if renamed:
        print(f"renamed {len(renamed)} Panel.prefab -> Dialog.prefab")

    targets: list[str] = []
    for dirpath, _, files in os.walk(root):
        for name in files:
            if name.endswith("Dialog.prefab") or name.endswith("Panel.prefab"):
                targets.append(os.path.join(dirpath, name))

    cleaned = 0
    for path in sorted(targets):
        if clean_prefab_file(path):
            cleaned += 1
            print("cleaned", os.path.relpath(path, root))

    print(f"done: {len(targets)} prefabs scanned, {cleaned} updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
