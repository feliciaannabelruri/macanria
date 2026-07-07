import { str, obj } from "./_helpers.js";

/* Skema PARALLAX - mengelola gambar & zoom cup pada engine parallax hero.
   Tiga slot cup dipetakan ke elemen ber-atribut data-px di index.html:
     cupSilver -> #cup-silver, #s1-mobile-cup, lineup (Soymilk Tea)
     cupGuava  -> #cup-guava,  lineup (Pink Guava)
     cupMochi  -> #cup-mochi,  lineup (Yu Tou Mochi)

   Field zoom* = seberapa besar cup membesar saat di-scroll (skala puncak).
   Disimpan sebagai string angka (engine parseFloat + clamp 0.2..10).
   Default perilaku: silver 1.0, guava 1.12, mochi 1.0 (sama seperti hardcoded).
   Field zoom bersifat opsional agar konten lama tetap valid. */
export default obj(
  {
    cupSilver: str(200),
    cupGuava:  str(200),
    cupMochi:  str(200),
    zoomSilver: str(6),
    zoomGuava:  str(6),
    zoomMochi:  str(6),
  },
  ["cupSilver", "cupGuava", "cupMochi"]
);