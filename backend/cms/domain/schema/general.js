import { str, arr, obj } from "./_helpers.js";
const spec   = obj({ label: str(20), value: str(40), sub: str(80) });
const card   = obj({ tag: str(40), zh: str(30), name: str(40), desc: str(200), img: str(200), specs: arr(spec, 3, 6) });
const lineup = obj({ name: str(40), price: str(20), img: str(200) });
export default obj({
  heroTaglineDesktop: str(40),
  heroTaglineMobile:  str(120),
  heroZh:             str(30),
  marqueeItems:       arr(str(40), 1, 12),
  featuredCards:      arr(card, 2, 2),
  lineup: obj({
    eyebrow: str(40), headline: str(60), zh: str(30),
    items: arr(lineup, 3, 3), footerAnchor: str(40),
  }),
});
