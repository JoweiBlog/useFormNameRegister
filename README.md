# useFormNameRegister

Form、Ant Design From - Name Path type checking

Ant Design form component has a generic `NamePath` type for its field names. It covers `name`, `dependencies`, `validateFields`, `setFieldValue` etc. This makes it hard for developers to connect field name with business field name, and TypeScript can not validate the field change effectively. Developers need to manually scan the field name to figure out the code update logic (back to JavaScript).

Provide two ways to register the names, which can help with TypeScript checking and reduce the missing of field name, to improve the develop experience.

### Register common field name

This is generally used in native form, and is more useful when used as a unique key.
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

### Register Ant Design form field name

This is for common array field name, and can be used in most of the scenes, such as `name`, `dependencies`, `validateFields`, `setFieldValue`.
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
  // In the case of `Form.List`, you can register other `r` for different entity type checking.
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
      {/* Only need to add `r` function in the original code to connect type checking; (the same applies to other scenes)  */}
      {/* <Form.Item dependencies={[["address", "0"]])> */}
      <Form.Item dependencies={r([["address", "0"]])}>
        {() => <Form.Item name={r(["address", "1"])}>...</Form.Item>}
      </Form.Item>
    </Form>
  );
};
```
