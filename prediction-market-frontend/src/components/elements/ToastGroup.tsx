import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const errorAlert = (text: string) => {
    toast.error(text, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
};

export const errorAlertCenter = (text: string) => {
    toast.error(text, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
};

export const warningAlert = (text: string) => {
    toast.warning(text, {
        className: "bg-black",
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
};

export const successAlert = (text: string) => {
    toast.success(text, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
};

export const infoAlert = (text: string) => {
    toast.info(text, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
    });
};