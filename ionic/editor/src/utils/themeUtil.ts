
function toggleDarkTheme(shouldAdd:any) {
    document.body.classList.toggle('dark', shouldAdd);
}

export default function setTheme(theme:string) {
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia(`(prefers-color-scheme: ${theme})`);

    toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));

    // Add or remove the "dark" class based on if the media query matches

}
