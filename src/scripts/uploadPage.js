let uploadForm;

const MAX_FILE_SIZE_IN_MB = 3;

document.addEventListener("DOMContentLoaded", () => {
  uploadForm = document.getElementById("uploadForm");
});

const submitForm = (edit) => {
  const errorMessageSpan = document.getElementById("errorMessage");
  const nameValue = uploadForm.elements.name.value;
  const inductionYear = uploadForm.elements.inductionYear.value;
  const startYear = uploadForm.elements.startYear.value;
  const endYear = uploadForm.elements.endYear.value;
  const imageFileCount = uploadForm.elements.imageFile?.files?.length;
  let errorMessage;
  if (
    nameValue === "" ||
    inductionYear === "" ||
    startYear === "" ||
    endYear === "" ||
    (!edit && imageFileCount === 0)
  ) {
    errorMessage = "All form elements are required";
  }
  const fileSize = fileUploader1.files[0]?.size;
  console.log("File size", fileSize);
  if (fileSize > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
    errorMessage = `File cannot be larger than ${MAX_FILE_SIZE_IN_MB}MB`;
  }
  console.log(nameValue);
  console.log(inductionYear);
  console.log(startYear);
  console.log(endYear);
  console.log(imageFileCount);
  if (!errorMessage) {
    uploadForm.submit();
  } else {
    errorMessageSpan.innerHTML = errorMessage;
  }
};

const addHonoree = () => {
  window.location = "/ui/uploadHonoree.html";
};

const listHonorees = () => {
  window.location = "/ui/listHonorees.html";
};

const editHonoree = (id) => {
  window.location = `/ui/editHonoree.html/${id}`;
};

const deleteHonoree = (id) => {
  fetch(`/api/${id}`, { method: "DELETE" }).then(() => {
    location.reload();
  });
};
