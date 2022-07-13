let uploadForm;
let sportSection;
let imagesSection;
let achievements;
let specialRecognition;
let startYear;
let startYearLabel;
let endYear;
let endYearLabel;

const MAX_FILE_SIZE_IN_MB = 3;

const hideShowAchievements = (checked) => {
  if (checked) {
    achievements.style.display = "block";
    startYear.style.display = "none";
    startYearLabel.style.display = "none";
    endYear.style.display = "none";
    endYearLabel.style.display = "none";
    sportSection.style.display = "none";
  } else {
    achievements.style.display = "none";
    startYear.style.display = "block";
    startYearLabel.style.display = "block";
    endYear.style.display = "block";
    endYearLabel.style.display = "block";
    sportSection.style.display = "flex";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  uploadForm = document.getElementById("uploadForm");
  imagesSection = document.getElementById("images");
  sportSection = document.getElementById("sports");
  achievements = document.getElementById("achievements");
  startYear = document.getElementById("startYear");
  endYear = document.getElementById("endYear");
  startYearLabel = document.getElementById("startYearLabel");
  endYearLabel = document.getElementById("endYearLabel");
  specialRecognition = document.getElementById("specialRecognition");
  if (specialRecognition) {
    hideShowAchievements(specialRecognition.checked);
  }
});

const handleSpecialRecognition = (specialRecognitionEvent) => {
  hideShowAchievements(specialRecognitionEvent.target.checked);
};

const submitForm = (edit, event) => {
  const errorMessageSpan = document.getElementById("errorMessage");
  const nameValue = uploadForm.elements.name.value;
  const inductionYear = uploadForm.elements.inductionYear.value;
  const specialRecognition = uploadForm.elements.specialRecognition.checked;
  const achievementsValue = uploadForm.elements.achievements.value;
  const startYear = uploadForm.elements.startYear.value;
  const endYear = uploadForm.elements.endYear.value;
  const defaultImageFile = uploadForm.elements.defaultImageFile.value;
  const imageFileCount = uploadForm.elements.imageFile?.files?.length;
  let errorMessage;
  if (
    nameValue === "" ||
    inductionYear === "" ||
    (!specialRecognition && (startYear === "" || endYear === "")) ||
    (!edit && imageFileCount === 0)
  ) {
    errorMessage = "All form elements are required";
  }
  let defaultImageFileMatches = false;
  const imageFileInputs =
    document.querySelectorAll("input[name='imageFile']") || [];
  imageFileInputs.forEach((fileUploader) => {
    const fileSize = fileUploader.files[0]?.size;
    // Ensure that the default image files matches an uploaded one
    if (fileUploader.files[0].name === defaultImageFile ) {
      defaultImageFileMatches =true
    } 
    console.log("File size", fileSize);
    if (fileSize > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
      errorMessage = `File cannot be larger than ${MAX_FILE_SIZE_IN_MB}MB`;
    }
  });

  const existingImages =
    document.querySelectorAll("input[name='imageName']") || [];
  existingImages.forEach((existingImage)=> {
    if (existingImage.value === defaultImageFile) {
      defaultImageFileMatches = true;
    }
  })
  if (!defaultImageFileMatches && defaultImageFile) {
    errorMessage="Default image file name does not match an image file name"
  }


  const sportNames = document.querySelectorAll("input[name='sportName']") || [];
  if (!specialRecognition && sportNames.length < 1) {
    errorMessage = `Must specify at least one sport`;
  }
  if (specialRecognition && !achievementsValue) {
    errorMessage = `Must specify achievements`;
  }

  console.log(nameValue);
  console.log(inductionYear);
  console.log(startYear);
  console.log(endYear);
  console.log(imageFileCount);
  if (!errorMessage) {
    uploadForm.submit();
  } else {
    event.preventDefault();
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
