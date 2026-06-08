type ProductTypeSelectProps = {
  defaultValue?: string;
};

export function ProductTypeSelect({ defaultValue = "" }: ProductTypeSelectProps) {
  return (
    <select
      className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
      defaultValue={defaultValue}
      id="product_type"
      name="product_type"
    >
      <option value="">请选择</option>
      <option value="衣服">衣服</option>
      <option value="前长后短衣服">前长后短衣服</option>
      <option value="手套">手套</option>
      <option value="围裙">围裙</option>
      <option value="分腿裤">分腿裤</option>
    </select>
  );
}
