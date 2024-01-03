import { useCallback } from "react";

export type Primitive = null | undefined | string | number | boolean | bigint | symbol;

export type BrowserNativeObject = Date | File | FileList;

export type IsTuple<T extends ReadonlyArray<unknown>> = number extends T["length"] ? false : true;

export type TupleKeys<T extends ReadonlyArray<unknown>> = Exclude<keyof T, keyof []>;

export type GetPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: GenPath<K & string, T[K]>;
      }[TupleKeys<T>]
    : GenPath<number, V>
  : {
      [K in keyof T]-?: GenPath<K & string, T[K]>;
    }[keyof T];

export type GenPath<K extends string | number, V> = V extends Primitive | BrowserNativeObject
  ? `${K}`
  : `${K}` | `${K}.${GetPath<V>}`;

export type GenArrayPath<T extends string> = T extends `${infer L}.${infer R}`
  ? [L, ...GenArrayPath<R>]
  : T extends `${infer L}`
  ? [L]
  : [];

export type KeyRegister<V> = <K extends GetPath<V>>(k: K) => K;

export type AntdKeyRegister<V> = {
  <K extends GenArrayPath<GetPath<V>>>(k: K): K;
  <K extends GenArrayPath<GetPath<V>>>(k: K[]): K[];
};

/**
 * form / Ant Design From - name TS检查
 *
 * @description
 * Ant Design 表单组件对 `name`、`dependencies`、`validateFields`、`setFieldValue` 等等的
 * 字段名使用泛型 `NamePath` 类型。这使得将字段名与业务字段关联变得困难，导致 TypeScript 无法有效地检查字段更改。
 * 开发人员须手动搜索字段名才能识别代码更新逻辑（回到 JavaScript 中）
 *
 * 提供两种注册name的方法，它们可以增强 TypeScript 检查，从而减少漏掉字段的可能性，改善开发体验。
 */
export default function useFormNameRegister<FormValues>() {
  /**
   * 注册通用name，一般在原生form表单中使用，作唯一key时比较有用
   * eg: 'a' | 'a.b' | 'a.0.d' | 'a.0.d.e'
   *
   * @example
   * ```ts
   * interface Entity {
   *   name: string;
   *   nickname: string;
   *   address: [string, string];
   *   books: { id: number; name: string }[];
   * }
   *
   * const Pages = () => {
   *   const { register } = useFormNameRegister<Entity>();
   *
   *   return (
   *     <form>
   *       <input type="text" name={register("name")} />
   *       <input type="text" name={register("address.0")} />
   *       <input type="text" name={register("books.2.name")} />
   *     </form>
   *   );
   * };
   * ```
   */
  const register = useCallback<KeyRegister<FormValues>>((k) => k, []);

  /**
   * 注册And design form name，通用数组field name
   * eg: ['a'] | ['a',b'] | ['a','0','d'] | ['a','0','d','e']
   *
   * @example
   * ```ts
   * interface Entity {
   *   name: string;
   *   nickname: string;
   *   address: [string, string];
   *   books: { id: number; name: string }[];
   * }
   *
   * const Pages = () => {
   *   const [form] = Form.useForm<Entity>();
   *   const { r } = useFormNameRegister<Entity>();
   *   // 如果有涉及到Form.List等应用场景，可以注册多个`r`完成不同类检查
   *   // const { r: _r } = useFormNameRegister<Entity["books"]>();
   *   // _r([`0`, "name"]);
   *
   *   return (
   *     <Form form={form}>
   *       <Form.Item name={r(["name"])}>
   *         <Input
   *           onChange={() => {
   *             form.setFieldValue(r(["nickname"]), "some name.");
   *           }}
   *         ></Input>
   *       </Form.Item>
   *       <Form.Item name={r(["address", "0"])}>...</Form.Item>
   *       <Form.Item dependencies={r([["address", "0"]])}>
   *         {() => <Form.Item name={r(["address", "1"])}>...</Form.Item>}
   *       </Form.Item>
   *     </Form>
   *   );
   * };
   * ```
   */
  const antdKeyRegister = useCallback<AntdKeyRegister<FormValues>>((k) => k, []);

  return { register, r: antdKeyRegister };
}
