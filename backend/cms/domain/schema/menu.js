import { str, arr, obj } from "./_helpers.js";
const badge    = str(20, { enum: ["", "Bestseller", "Recommended", "Signature"] });
const item     = obj({ name: str(60), zh: str(30), desc: str(200), price: str(20), badge });
const category = obj({ label: str(40), zh: str(20), note: str(160), items: arr(item, 1, 30) });
export default obj({
  categories: obj({ soymilk: category, pure: category, fruit: category }),
});
