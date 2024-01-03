# useFormNameRegister

form / Ant Design From - name TS检查

Ant Design 表单组件对 `name`、`dependencies`、`validateFields`、`setFieldValue` 等等的字段名使用泛型 `NamePath` 类型。这使得将字段名与业务字段关联变得困难，导致 TypeScript 无法有效地检查字段更改。开发人员须手动搜索字段名才能识别代码更新逻辑（回到 JavaScript 中）。

提供两种注册name的方法，它们可以增强 TypeScript 检查，从而减少漏掉字段的可能性，改善开发体验。


### 注册通用field name

一般在原生form表单中使用，作唯一key时比较有用
```ts
interface Entity {
  name: string;
  nickname: string;
  address: [string, string];
  books: { id: number; name: string }[];
}

const Pages = () => {
  const { register } = useFormNameRegister<Entity>();

  return (
    <form>
      <input type="text" name={register("name")} />
      <input type="text" name={register("address.0")} />
      <input type="text" name={register("books.2.name")} />
    </form>
  );
};
```

### 注册And Design form name

通用数组field name, 可以应用与`name`、`dependencies`、`validateFields`、`setFieldValue` 等大多数场景。
```ts
interface Entity {
  name: string;
  nickname: string;
  address: [string, string];
  books: { id: number; name: string }[];
}

const Pages = () => {
  const [form] = Form.useForm<Entity>();
  const { r } = useFormNameRegister<Entity>();
  // 如果有涉及到Form.List等应用场景，可以注册多个`r`完成不同类检查
  // const { r: _r } = useFormNameRegister<Entity["books"]>();
  // _r([`0`, "name"]);

  return (
    <Form form={form}>

      <Form.Item name={r(["name"])}>
        <Input
          onChange={() => {
            form.setFieldValue(r(["nickname"]), "some name.");
          }}
        ></Input>
      </Form.Item>
      <Form.Item name={r(["address", "0"])}>...</Form.Item>
      {/* 仅需在原代码上加`r`函数，关联ts检查；（其他场景亦是） */}
      {/* <Form.Item dependencies={[["address", "0"]])> */}
      <Form.Item dependencies={r([["address", "0"]])}>
        {() => <Form.Item name={r(["address", "1"])}>...</Form.Item>}
      </Form.Item>
    </Form>
  );
};
```
