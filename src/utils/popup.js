import Swal from "sweetalert2";

const buttonColors = {
    confirm: "#16a34a",
    danger: "#dc2626",
    neutral: "#4b5563",
    cancel: "#6b7280",
};

export const showPopup = ({
    icon = "info",
    title = "Notice",
    text = "",
    html,
    confirmButtonText = "OK",
    confirmButtonColor,
} = {}) =>
    Swal.fire({
        icon,
        title,
        text,
        html,
        confirmButtonText,
        confirmButtonColor:
            confirmButtonColor || (icon === "error" || icon === "warning" ? buttonColors.danger : buttonColors.confirm),
    });

export const showSuccessPopup = (title = "Success", text = "Action completed successfully.") =>
    showPopup({ icon: "success", title, text });

export const showErrorPopup = (title = "Action Required", text = "Please check the details and try again.") =>
    showPopup({ icon: "error", title, text });

export const showInfoPopup = (title = "Information", text = "") => showPopup({ icon: "info", title, text });

export const showConfirmPopup = async ({
    title = "Are you sure?",
    text = "",
    html,
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel",
    confirmButtonColor = buttonColors.danger,
    icon = "warning",
} = {}) => {
    const result = await Swal.fire({
        icon,
        title,
        text,
        html,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        confirmButtonColor,
        cancelButtonColor: buttonColors.cancel,
        reverseButtons: true,
    });

    return result.isConfirmed;
};
