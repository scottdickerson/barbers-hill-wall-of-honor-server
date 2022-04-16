let uploadForm;
let sportSection;
let imagesSection;

const MAX_FILE_SIZE_IN_MB = 3;

document.addEventListener("DOMContentLoaded", () => {
  uploadForm = document.getElementById("uploadForm");
  sportSection = document.getElementById("sports");
  imagesSection = document.getElementById("images");
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
  const imageFileInputs =
    document.querySelectorAll("input[name='imageFile']") || [];
  imageFileInputs.forEach((fileUploader) => {
    const fileSize = fileUploader.files[0]?.size;
    console.log("File size", fileSize);
    if (fileSize > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
      errorMessage = `File cannot be larger than ${MAX_FILE_SIZE_IN_MB}MB`;
    }
  });

  const sportNames = document.querySelectorAll("input[name='sportName']") || [];
  if (sportNames.length < 1) {
    errorMessage = `Must specify at least one sport`;
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

const removeRow = (type, rowIndex) => {
  const rowToRemove = document.getElementById(`new-row-${type}-${rowIndex}`);
  rowToRemove.parentNode.removeChild(rowToRemove);
};

const addRow = (type) => {
  const nextNumber =
    document.querySelectorAll(`[data-${type}]`)?.length + 1 || 1;

  const rowSection = type === "image" ? imagesSection : sportSection;
  const newRowHeader = document.createElement("h3");
  newRowHeader.innerHTML = `${type} ${nextNumber}`;

  const newRow = document.createElement("div");
  newRow.id = `new-row-${type}-${nextNumber}`;

  const newRowFormDiv = document.createElement("div");
  newRowFormDiv.style = `
  display: flex;
  gap: 1rem;
  white-space: nowrap;
  align-items: flex-start;
  width: 1200px;
  flex-flow: column;
`;
  newRowFormDiv.setAttribute(`data-${type}`, "true");
  newRowFormDiv.id = `${type}${nextNumber}`;

  const newRowLabel = document.createElement("label");
  newRowLabel.innerHTML = `${type} ${nextNumber} name`;
  newRowLabel.id = `${type}NameLabel${nextNumber}`;

  const newRowNameInput = document.createElement("input");
  newRowNameInput["aria-labelledby"] = `${type}NameLabel${nextNumber}`;
  if (type === "image") {
    newRowNameInput.id = `fileUploader${nextNumber}`;
    newRowNameInput.type = "file";
    newRowNameInput.style.width = "800px";
    newRowNameInput.name = `${type}File`;
  } else {
    newRowNameInput.id = `${type}Name${nextNumber}`;
    newRowNameInput.type = "text";
    newRowNameInput.name = `${type}Name`;
  }

  const newRowDescriptionLabel = document.createElement("label");
  newRowDescriptionLabel.innerHTML = `${type} ${nextNumber} description`;
  newRowDescriptionLabel.id = `${type}DescriptionLabel${nextNumber}`;
  const newRowDescriptionInput = document.createElement("textarea");
  newRowDescriptionInput.id = `${type}Description${nextNumber}`;
  newRowDescriptionInput[
    "aria-labelledby"
  ] = `${type}DescriptionLabel${nextNumber}`;
  newRowDescriptionInput.name = `${type}Description`;
  newRowDescriptionInput.rows = "5";
  newRowDescriptionInput.columns = "30";
  newRowDescriptionInput.style = "width:800px;";

  const newRowDeleteButton = document.createElement("button");
  newRowDeleteButton.type = "button";
  newRowDeleteButton.innerHTML = `Remove ${type} ${nextNumber}`;
  newRowDeleteButton.setAttribute(`data-${type}-number`, nextNumber);
  newRowDeleteButton.addEventListener("click", () =>
    removeRow(type, nextNumber)
  );
  newRowDeleteButton.style = "width:200px";

  const newRowSeparator = document.createElement("hr");
  newRowSeparator.style = "width: 800px; margin-left: 0;";

  newRowFormDiv.appendChild(newRowLabel);
  newRowFormDiv.appendChild(newRowNameInput);
  newRowFormDiv.appendChild(newRowDescriptionLabel);
  newRowFormDiv.appendChild(newRowDescriptionInput);

  rowSection.appendChild(newRow);
  newRow.appendChild(newRowHeader);
  newRow.appendChild(newRowFormDiv);
  newRow.appendChild(newRowDeleteButton);
  newRow.appendChild(newRowSeparator);
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
