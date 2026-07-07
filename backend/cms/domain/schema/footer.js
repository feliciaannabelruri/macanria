import { str, arr, obj } from "./_helpers.js";
const link = obj({ label: str(40), href: str(300) });
export default obj({
  title: str(40), subtext: str(60), description: str(300),
  menuLinks: arr(link, 0, 8), orderLinks: arr(link, 0, 8), infoLinks: arr(link, 0, 8),
  copyright: str(160), social: arr(link, 0, 8),
});
