---
name: base-ui context requirements
description: base-ui primitives that silently fail to render when placed outside their required parent context
---

## Rule
base-ui components must always be nested inside their required parent context primitive, or the popup/content silently fails to render (no visible error in dev, popup just never appears).

## Known pairs

| Child | Must be inside |
|---|---|
| `Dialog.Title` / `Dialog.Description` | `Dialog.Popup` (i.e. `DialogContent`) |
| `Menu.GroupLabel` | `Menu.Group` (i.e. `DropdownMenuGroup`) |
| `Accordion.Panel` | `Accordion.Item` |

## Why
base-ui uses React context internally. Children that consume context outside its provider get undefined context and throw/bail silently during render, so the popup opens but renders nothing — or doesn't open at all.

## How to apply
When a popup/dropdown/dialog "doesn't appear" after clicking a trigger, check that all base-ui child primitives are correctly nested inside their required parent. Common mistake: placing `DialogHeader` (wrapping `Dialog.Title`) as a sibling of `Dialog.Popup` instead of inside it, or using `Menu.GroupLabel` directly inside `Menu.Popup` without a `Menu.Group` wrapper.
