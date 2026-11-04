const API_URL =
  "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json"
const ALTERNATIVE_API_URL =
  "https://akabab.github.io/superhero-api/api/all.json"
let allCharactersPromise = null

export async function getAllCharacters() {
  if (!allCharactersPromise) allCharactersPromise = fetchCharacterData()
  return allCharactersPromise
}

async function fetchCharacterData() {
  try {
    return await fetchFromUrl(API_URL)
  } catch (error) {
    console.warn(
      "Primary API unavailable. Trying the alternative endpoint.",
      error,
    )
    return fetchFromUrl(ALTERNATIVE_API_URL)
  }
}

async function fetchFromUrl(url) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`API request failed with status ${response.status}`)
  return response.json()
}

export async function getMarvelCharacters() {
  const characters = await getAllCharacters()
  return characters.filter(
    (character) => character.biography.publisher === "Marvel Comics",
  )
}

export async function getCharacterById(id) {
  const characters = await getMarvelCharacters()
  return characters.find((character) => character.id === Number(id))
}

export function getAvailableText(value) {
  return !value || value === "-" || value === "null"
    ? "Information not available"
    : value
}

export function escapeHtml(value) {
  const element = document.createElement("div")
  element.textContent = String(value)
  return element.innerHTML
}
