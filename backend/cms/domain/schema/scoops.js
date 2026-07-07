import { str, arr, obj } from "./_helpers.js";
const flavour = obj({ name: str(60), zh: str(30), desc: str(200), img: str(200) });
export default obj({
  intro: str(400), price: str(60),
  flavours: arr(flavour, 1, 20),
  toppings: arr(str(40), 0, 12),
});
