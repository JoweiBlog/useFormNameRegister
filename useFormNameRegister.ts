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
 * Form、Ant Design From - Name Path type checking
 *
 * @description
 * Ant Design form component has a generic NamePath type for its field names. 
 * It covers name, dependencies, validateFields, setFieldValue etc. 
 * This makes it hard for developers to connect field name with business field name, 
 * and TypeScript can not validate the field change effectively. 
 * Developers need to manually scan the field name to figure out the code update logic (back to JavaScript).
 *
 * Provide two ways to register the names, which can help with TypeScript checking 
 * and reduce the missing of field name, to improve the develop experience.
 */
export default function useFormNameRegister<FormValues>() {
  /**
   * Register common field name.
   * This is generally used in native form, and is more useful when used as a unique key.
   * 
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
   * Register Ant Design form field name
   * This is for common array field name, and can be used in most of the scenes, 
   * such as name, dependencies, validateFields, setFieldValue.
   *
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
