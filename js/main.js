/* Afterflix — comportamento (versão limpa) */
(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* header: fica sólido depois do hero */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("solid", scrollY > 700);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* menu mobile */
  const burger = $(".burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => {
    if (e.target.closest("a")) { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
  });

  /* vídeo do hero: só aparece quando começa a tocar */
  const v = $(".hero-bg video");
  if (v) {
    v.addEventListener("playing", () => v.classList.add("on"), { once: true });
    v.play().catch(() => {});
  }

  /* carrosséis: setas + arrastar com o mouse */
  $$(".row").forEach(row => {
    const track = $(".track", row);
    const step = () => track.clientWidth * 0.8;
    $(".prev", row).addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    $(".next", row).addEventListener("click", () => track.scrollBy({ left:  step(), behavior: "smooth" }));

    let down = false, startX = 0, startL = 0, moved = 0;
    track.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = 0; startX = e.clientX; startL = track.scrollLeft;
    });
    addEventListener("pointermove", e => {
      if (!down) return;
      moved = e.clientX - startX;
      if (Math.abs(moved) > 5) track.classList.add("drag");
      track.scrollLeft = startL - moved;
    });
    addEventListener("pointerup", () => { down = false; setTimeout(() => track.classList.remove("drag"), 0); });
    track.addEventListener("click", e => { if (Math.abs(moved) > 5) e.preventDefault(); }, true);
  });

  /* depoimentos */
  const slides = $$(".slide"), dots = $$(".dots i");
  let cur = 0;
  const show = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("on", k === cur));
    dots.forEach((d, k) => d.classList.toggle("on", k === cur));
  };
  $(".sl-btn.prev")?.addEventListener("click", () => show(cur - 1));
  $(".sl-btn.next")?.addEventListener("click", () => show(cur + 1));
})();
