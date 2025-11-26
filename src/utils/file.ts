export function downloadFile(url: string, fileName?: string) {
  const link = document.createElement("a")
  link.style.display = "none"
  link.href = url
  if (fileName) {
    link.download = fileName
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
