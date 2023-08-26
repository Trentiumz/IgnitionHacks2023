window.onload = () => {
  // handle form submission
  document.getElementById('generation-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      notes_id: formData.get('notes').split('-').slice(-1)[0]
    }
    console.log(data)
  })
}

