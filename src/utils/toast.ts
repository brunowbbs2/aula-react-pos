import { toast } from "react-toastify"

export const toastSucess = (text: string) => toast(text, { hideProgressBar:true, style: { backgroundColor: "green", color: "white" } })

export const toastError = (text: string) => toast(text, { hideProgressBar:true, style: { backgroundColor: "red", color: "white" } })