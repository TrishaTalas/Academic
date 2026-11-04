import { escapeHtml, getAvailableText, getMarvelCharacters } from "./api.js"

document.addEventListener("DOMContentLoaded", loadHomepage)

async function loadHomepage() {
  try {
    const characters = await getMarvelCharacters()
    const names = ["Spider-Man", "Iron Man", "Black Panther", "Captain America"]
    const featured = names
      .map((name) => characters.find((character) => character.name === name))
      .filter(Boolean)
    document.getElementById("heroCharacterCount").textContent =
      characters.length
    displayHero(featured[0])
    document.getElementById("featuredCharacters").innerHTML = featured
      .map(createFeaturedCard)
      .join("")
  } catch (error) {
    console.error("Unable to load homepage characters:", error)
    document.getElementById("heroLoading").innerHTML =
      '<p class="small">Artwork unavailable</p>'
    document.getElementById("featuredCharacters").innerHTML =
      '<p class="text-center text-secondary py-5">Featured characters are temporarily unavailable.</p>'
  }
}

function displayHero(character) {
  if (!character) return
  const image = document.getElementById("heroCharacterImage")
  image.src = character.images.lg
  image.alt = character.name
  image.addEventListener("load", () => {
    document.getElementById("heroLoading").hidden = true
    image.classList.add("loaded")
  })
  document.querySelector(".hero-character-label strong").textContent =
    character.name
}

function createFeaturedCard(character, index) {
  return `<div class="col-sm-6 col-lg-3"><a class="featured-card" href="view.html?id=${character.id}"><div class="featured-image"><img src="${character.images.lg}" alt="${escapeHtml(character.name)}" loading="lazy"><span>0${index + 1}</span></div><div class="featured-card-body"><div><small>${escapeHtml(getAvailableText(character.biography.alignment))}</small><h3>${escapeHtml(character.name)}</h3></div><i class="bi bi-arrow-up-right"></i></div></a></div>`
}
