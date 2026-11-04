import { escapeHtml, getAvailableText, getMarvelCharacters } from "./api.js"

let marvelCharacters = []
let currentCharacterIndex = -1
const listState = new URLSearchParams()

document.addEventListener("DOMContentLoaded", initializeProfile)

async function initializeProfile() {
  const parameters = new URLSearchParams(window.location.search)
  preserveListState(parameters)
  if (!parameters.get("id")) return showProfileError()

  try {
    marvelCharacters = await getMarvelCharacters()
    currentCharacterIndex = marvelCharacters.findIndex(
      (character) => character.id === Number(parameters.get("id")),
    )
    if (currentCharacterIndex < 0) return showProfileError()
    displayCharacter(marvelCharacters[currentCharacterIndex])
    configureNavigation()
  } catch (error) {
    console.error("Unable to load character profile:", error)
    showProfileError()
  }
}

function preserveListState(parameters) {
  ;["page", "search", "filter"].forEach((key) => {
    if (parameters.has(key)) listState.set(key, parameters.get(key))
  })
  document.getElementById("backToCharacters").href = listState.toString()
    ? `characters.html?${listState}`
    : "characters.html"
}

function displayCharacter(character) {
  document.title = `${character.name} — Marvel Universe`
  document.getElementById("characterNumber").textContent =
    `#${String(character.id).padStart(3, "0")}`
  document.getElementById("characterName").textContent = character.name
  document.getElementById("characterRealName").textContent = getAvailableText(
    character.biography.fullName,
  )
  document.getElementById("characterDescription").textContent =
    createSummary(character)
  document.getElementById("alignmentBadge").textContent = getAvailableText(
    character.biography.alignment,
  )
  document.getElementById("publisherBadge").textContent = getAvailableText(
    character.biography.publisher,
  )
  const image = document.getElementById("characterImage")
  image.src = character.images.lg
  image.alt = character.name

  displayDetails("biographyDetails", [
    ["Full name", character.biography.fullName],
    ["Aliases", formatArray(character.biography.aliases)],
    ["Place of birth", character.biography.placeOfBirth],
    ["First appearance", character.biography.firstAppearance],
    ["Publisher", character.biography.publisher],
    ["Alignment", character.biography.alignment],
    ["Occupation", character.work.occupation],
    ["Base", character.work.base],
  ])
  displayDetails("appearanceDetails", [
    ["Gender", character.appearance.gender],
    ["Race", character.appearance.race],
    ["Height", formatMeasurement(character.appearance.height)],
    ["Weight", formatMeasurement(character.appearance.weight)],
    ["Eye color", character.appearance.eyeColor],
    ["Hair color", character.appearance.hairColor],
  ])
  displayDetails("connectionDetails", [
    ["Group affiliation", character.connections.groupAffiliation],
    ["Relatives", character.connections.relatives],
  ])
  displayPowerStatistics(character.powerstats)
  document.getElementById("profileLoading").hidden = true
  document.getElementById("profileContent").hidden = false
}

function createSummary(character) {
  const occupation = getAvailableText(character.work.occupation)
  const birthplace = getAvailableText(character.biography.placeOfBirth)
  if (
    occupation === "Information not available" &&
    birthplace === "Information not available"
  )
    return `${character.name} is a Marvel Comics character whose complete history remains classified.`
  if (birthplace === "Information not available")
    return `${character.name} is known for ${occupation.toLowerCase()}.`
  return `Originating from ${birthplace}, ${character.name} is known for ${occupation.toLowerCase()}.`
}

function displayDetails(id, details) {
  document.getElementById(id).innerHTML = details
    .map(
      ([label, value]) =>
        `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(getAvailableText(value))}</dd></div>`,
    )
    .join("")
}

function displayPowerStatistics(stats) {
  const statistics = [
    ["Intelligence", stats.intelligence],
    ["Strength", stats.strength],
    ["Speed", stats.speed],
    ["Durability", stats.durability],
    ["Power", stats.power],
    ["Combat", stats.combat],
  ]
  document.getElementById("powerStatistics").innerHTML = statistics
    .map(([label, score]) => {
      const value = Number(score) || 0
      return `<div class="power-stat"><div class="power-stat-label"><span>${label}</span><strong>${value}</strong></div><div class="power-track"><span style="width:${Math.min(value, 100)}%"></span></div></div>`
    })
    .join("")
}

function configureNavigation() {
  const previous =
    marvelCharacters[
      (currentCharacterIndex - 1 + marvelCharacters.length) %
        marvelCharacters.length
    ]
  const next =
    marvelCharacters[(currentCharacterIndex + 1) % marvelCharacters.length]
  configureLink("previousCharacter", "previousCharacterName", previous)
  configureLink("nextCharacter", "nextCharacterName", next)
}

function configureLink(linkId, nameId, character) {
  const parameters = new URLSearchParams(listState)
  parameters.set("id", character.id)
  document.getElementById(linkId).href = `view.html?${parameters}`
  document.getElementById(nameId).textContent = character.name
}

function formatArray(values) {
  if (!Array.isArray(values)) return values
  const useful = values.filter((value) => value && value !== "-")
  return useful.length ? useful.join(", ") : "Information not available"
}

function formatMeasurement(values) {
  if (!Array.isArray(values)) return values
  return (
    values.find((value) => value && value !== "0 cm" && value !== "0 kg") ||
    "Information not available"
  )
}

function showProfileError() {
  document.getElementById("profileLoading").hidden = true
  document.getElementById("profileError").hidden = false
}
