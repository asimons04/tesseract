export const dispatchWindowEvent = function<DetailType> (name:string, detail:DetailType) {
    window.dispatchEvent(
        new CustomEvent(name, { 
            bubbles: true,
            detail: detail
        })
    )
}