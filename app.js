const links = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");

links.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = link.getAttribute("data-page");

    // hide all pages
    pages.forEach(page => {
      page.classList.remove("active");
    });

    // show selected page
    document.getElementById(target).classList.add("active");
  });
});

