import { getToasterBasedOnType } from "../components/Toaster";

const copyToClipboard = (value) => {
  if (value) {
    if (navigator && navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
        .then(() => getToasterBasedOnType({
                    type: "success",
                    message: "Copied To Clipboard"
                })
        )
        .catch((err) => console.log(err))
    } else {
      const textField = document.createElement('textarea')
      textField.innerText = `${value}`
      document.body.appendChild(textField)
      textField.select()
      document.execCommand('copy')
      getToasterBasedOnType({
            type: "success",
            message: "Copied To Clipboard"
        });
      textField.remove()
    }
  }
}

export default copyToClipboard
