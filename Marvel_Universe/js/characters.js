import { escapeHtml, getAvailableText, getMarvelCharacters } from "./api.js"

const CHARACTERS_PER_PAGE = 20
let marvelCharacters = []
let filteredCharacters = []
let currentPage = 1
let activeFilter = "all"

const searchInput = document.getElementById("searchInput")
const clearSearchButton = document.getElementById("clearSearchButton")
const characterGrid = document.getElementById("characterGrid")
const loadingState = document.getElementById("loadingState")
const errorState = document.getElementById("errorState")
const emptyState = document.getElementById("emptyState")
const pagination = document.getElementById("paginationContainer")

document.addEventListener("DOMContentLoaded", initializePage)

async function initializePage() {
  readUrlState()
  attachEvents()
  await loadCharacters()
}

async function loadCharacters() {
  showState("loading")
  try {
    marvelCharacters = await getMarvelCharacters()
    document.getElementById("totalSummary").textContent =
      `${marvelCharacters.length} total Marvel characters`
    applyFilters(false)
  } catch (error) {
    console.error("Unable to load characters:", error)
    showState("error")
  }
}

function readUrlState() {
  const parameters = new URLSearchParams(window.location.search)
  searchInput.value = parameters.get("search") || ""
  currentPage = Math.max(1, Number(parameters.get("page")) || 1)
  const requestedFilter = parameters.get("filter")
  if (["all", "heroes", "villains", "male", "female"].includes(requestedFilter))
    activeFilter = requestedFilter
  updateActiveButton()
}

function attachEvents() {
  searchInput.addEventListener("input", () => {
    currentPage = 1
    applyFilters()
  })
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = ""
    searchInput.focus()
    currentPage = 1
    applyFilters()
  })
  document
    .getElementById("filterButtons")
    .addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]")
      if (!button) return
      activeFilter = button.dataset.filter
      currentPage = 1
      updateActiveButton()
      applyFilters()
    })
  document
    .getElementById("previousButton")
    .addEventListener("click", () => changePage(currentPage - 1))
  document
    .getElementById("nextButton")
    .addEventListener("click", () => changePage(currentPage + 1))
  document.getElementById("resetButton").addEventListener("click", resetFilters)
  document
    .getElementById("retryButton")
    .addEventListener("click", loadCharacters)
}

function applyFilters(updateUrl = true) {
  const searchTerm = searchInput.value.trim().toLowerCase()
  filteredCharacters = marvelCharacters.filter((character) => {
    return (
      character.name.toLowerCase().includes(searchTerm) &&
      matchesFilter(character)
    )
  })
  currentPage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(filteredCharacters.length / CHARACTERS_PER_PAGE)),
  )
  if (updateUrl) updateBrowserUrl()
  clearSearchButton.hidden = !searchTerm
  displayCharacters()
}

function matchesFilter(character) {
  if (activeFilter === "heroes") return character.biography.alignment === "good"
  if (activeFilter === "villains")
    return character.biography.alignment === "bad"
  if (activeFilter === "male" || activeFilter === "female")
    return character.appearance.gender.toLowerCase() === activeFilter
  return true
}

function displayCharacters() {
  showState("results")
  updateSummary()
  if (!filteredCharacters.length) {
    emptyState.hidden = false
    characterGrid.innerHTML = ""
    pagination.hidden = true
    return
  }
  const start = (currentPage - 1) * CHARACTERS_PER_PAGE
  characterGrid.innerHTML = filteredCharacters
    .slice(start, start + CHARACTERS_PER_PAGE)
    .map(createCard)
    .join("")
  updatePagination()
}

function createCard(character) {
  const parameters = new URLSearchParams({
    id: character.id,
    page: currentPage,
  })
  if (searchInput.value.trim())
    parameters.set("search", searchInput.value.trim())
  if (activeFilter !== "all") parameters.set("filter", activeFilter)
  const alignment = getAvailableText(character.biography.alignment)
  const alignmentClass =
    alignment === "good" ? "hero" : alignment === "bad" ? "villain" : "neutral"
  const url = `view.html?${parameters.toString()}`
  return `<div class="col-sm-6 col-lg-4 col-xl-3"><article class="character-card"><a class="character-card-image" href="${url}"><img src="${character.images.md}" alt="${escapeHtml(character.name)}" loading="lazy"><span class="alignment-badge ${alignmentClass}">${escapeHtml(alignment)}</span><span class="card-number">#${String(character.id).padStart(3, "0")}</span></a><div class="character-card-body"><div><p>${escapeHtml(getAvailableText(character.biography.fullName))}</p><h2>${escapeHtml(character.name)}</h2></div><a href="${url}">View details <i class="bi bi-arrow-right"></i></a></div></article></div>`
}

function updateSummary() {
  const term = searchInput.value.trim()
  document.getElementById("resultsSummary").textContent =
    `${filteredCharacters.length} character${
      filteredCharacters.length === 1 ? "" : "s"
    } found${term ? ` for “${term}”` : ""}`
}

function updatePagination() {
  const totalPages = Math.ceil(filteredCharacters.length / CHARACTERS_PER_PAGE)
  pagination.hidden = totalPages <= 1
  document.getElementById("currentPageDisplay").textContent = currentPage
  document.getElementById("totalPagesDisplay").textContent = totalPages
  document.getElementById("previousButton").disabled = currentPage === 1
  document.getElementById("nextButton").disabled = currentPage === totalPages
}

function changePage(page) {
  const totalPages = Math.ceil(filteredCharacters.length / CHARACTERS_PER_PAGE)
  if (page < 1 || page > totalPages) return
  currentPage = page
  updateBrowserUrl()
  displayCharacters()
  document
    .querySelector(".results-toolbar")
    .scrollIntoView({ behavior: "smooth" })
}

function updateBrowserUrl() {
  const parameters = new URLSearchParams()
  if (searchInput.value.trim())
    parameters.set("search", searchInput.value.trim())
  if (activeFilter !== "all") parameters.set("filter", activeFilter)
  if (currentPage > 1) parameters.set("page", currentPage)
  window.history.replaceState(
    {},
    "",
    parameters.toString() ? `characters.html?${parameters}` : "characters.html",
  )
}

function updateActiveButton() {
  document
    .querySelectorAll("[data-filter]")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.filter === activeFilter),
    )
}

function resetFilters() {
  searchInput.value = ""
  activeFilter = "all"
  currentPage = 1
  updateActiveButton()
  applyFilters()
}

function showState(state) {
  loadingState.hidden = state !== "loading"
  errorState.hidden = state !== "error"
  emptyState.hidden = true
  if (state !== "results") {
    characterGrid.innerHTML = ""
    pagination.hidden = true
  }
}
