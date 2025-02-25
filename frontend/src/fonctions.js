export function clickAnimation(id) {
    document.getElementById(id).classList.add("clicked");

    setTimeout(() => {
        document.getElementById(id).classList.remove("clicked");
    }, 200);
}