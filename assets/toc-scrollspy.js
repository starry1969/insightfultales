<script>
window.addEventListener("DOMContentLoaded", () => {
  // Find the TOC container (sidebar or top)
  const toc = document.querySelector("#TOC, #quarto-sidebar-toc");
  if (!toc) return;

  // All TOC links that point to sections on the page
  const tocLinks = Array.from(
    toc.querySelectorAll('a[data-scroll-target], a[href^="#"]')
  );
  if (!tocLinks.length) return;

  // Map links -> section elements
  let sections = tocLinks
    .map(link => {
      let target = link.getAttribute("data-scroll-target");
      if (target && target.startsWith("#")) {
        return document.querySelector(target);
      }

      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        return document.querySelector(href);
      }

      return null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  // Sort sections by vertical position, top to bottom
  sections.sort((a, b) => a.offsetTop - b.offsetTop);

  const clearActive = () => {
    tocLinks.forEach(link => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
  };

  const setActiveForId = (id) => {
    if (!id) return;

    const link = tocLinks.find(l => {
      const ds = l.getAttribute("data-scroll-target");
      if (ds && ds === `#${id}`) return true;
      const href = l.getAttribute("href");
      if (href && href === `#${id}`) return true;
      return false;
    });

    if (!link) return;

    clearActive();
    link.classList.add("active");
    link.setAttribute("aria-current", "location");
  };

  // Update active link based on scroll position
  const updateActiveOnScroll = () => {
    const scrollPos =
      window.scrollY || document.documentElement.scrollTop || 0;

    // Adjust for fixed navbar / padding at top (tweak if needed)
    const offset = 140;

    let currentId = sections[0].id;

    for (const sec of sections) {
      if (sec.offsetTop - offset <= scrollPos) {
        currentId = sec.id;
      } else {
        break;
      }
    }

    setActiveForId(currentId);
  };

  // Run on load
  updateActiveOnScroll();

  // Update on scroll and resize
  window.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateActiveOnScroll);
  });

  window.addEventListener("resize", () => {
    // Recompute positions on resize (optional but safe)
    sections.sort((a, b) => a.offsetTop - b.offsetTop);
    updateActiveOnScroll();
  });

  // Also handle clicking TOC links (so it highlights immediately on click)
  tocLinks.forEach(link => {
    link.addEventListener("click", () => {
      const ds = link.getAttribute("data-scroll-target");
      const href = link.getAttribute("href");

      let id = null;
      if (ds && ds.startsWith("#")) id = ds.slice(1);
      else if (href && href.startsWith("#")) id = href.slice(1);

      if (id) setActiveForId(id);
    });
  });
});
</script>
