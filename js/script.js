// get the file input element and the field
const fileInput = document.getElementById("data");
const fileInputField = fileInput.closest(".file-input-field");
const cardList = document.querySelector(".upload-cards");
const images = [];

// add click event listener to the card list and delegate to the buttons
cardList.addEventListener("click", (e) => {
  // if the target is a cancel button
  if (e.target.closest(".cancel-button")) {
    e.preventDefault();
    const card = e.target.closest(".upload-card");
    const cardName = card.dataset.cardId;

    images.forEach((image, index) => {
      if (image.name === cardName) {
        images.splice(index, 1);
      }
    });
    // console.log(cardName);
    // remove the card from the DOM
    card.remove();
    // remove from the upload server too

    // if there are no more cards, remove the check btn and add information text
    if (!cardList.querySelector(".upload-card")) {
      document.querySelector(".check-btn").classList.add("d-none");
      document.querySelector(".info-text").classList.remove("d-none");
    }
  }
});

fileInput.addEventListener("change", (e) => {
  handleFilesInput(e.target.files);
});
// when anything is dragged over the surface of the field add the modifier class
fileInputField.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileInputField.classList.add("file-input-field--over");
});

// when the drag is ended or left, remove the modifier class
["dragend", "dragleave"].forEach((evt) => {
  fileInputField.addEventListener(evt, (e) => {
    e.preventDefault();
    fileInputField.classList.remove("file-input-field--over");
  });
});

// if the item is dropped on the field
fileInputField.addEventListener("drop", (e) => {
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    // insert the file in the input element
    fileInput.files = e.dataTransfer.files;
    // handle the drop on the field to display cards
    handleFilesInput(fileInput.files);
  }
  // remove the modifier class
  fileInputField.classList.remove("file-input-field--over");
});

// handle the files dropping
const handleFilesInput = (files) => {
  // empty images array
  images.splice(0, images.length);

  // clear the cardlist of an cards / backend - stop the upload of all files
  if (document.querySelector(".upload-card")) {
    document.querySelectorAll(".upload-card").forEach((card) => {
      card.remove();
    });
  }

  // show btn
  document.querySelector(".check-btn").classList.remove("d-none");
  // remove information text
  document.querySelector(".info-text").classList.add("d-none");

  // add preloader
  showPreloader();

  // run through all the properties of the filelist and select the actual files
  for (file in files) {
    if (files[file].type) {
      // handle the rendering of each file
      handleFilesRender(files[file]);
    }
  }
};
// handle rendering of the files
const handleFilesRender = (file) => {
  // only create card if it's an image alone
  if (file.type.startsWith("image/")) {
    // instantiate a file reader to get the file URL
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      // set the imageURL to the image object
      // image.URL = fileReader.result;
      images.push({ name: file.name, URL: fileReader.result });
      // when the file reader reads the file, create the card
      card = `
      <div class="mb-3 rounded media container upload-card bg-white" data-card-id="${file.name}">
        <div class="row">
          <div class="align-self-center img-container col-3">
            <img src="${fileReader.result}" class=" img-thumbnail border-0" alt="">
          </div>
          <div class="col-10 media-body p-2 upload-card-body">
            <button class="border-0 bg-transparent cancel-button"><span class="fas fa-times text-danger"></span></button>
            <p class="darkblue-text font-weight-bold card-title text-truncate">${file.name}</p>
            <div class="progress w-75" style="height: 8px;">
              <div class="progress-bar bg-primary rounded-pill" role="progressbar" style="width: 10%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p class="darkblue-text font-weight-bold upload-status mt-3 mb-0">Upload status</p>
          </div>
        </div>
      </div>
      `;
      // after card creation render the file
      renderCard(card);
    };
  }
};
// render the card and remoive the preloader
const renderCard = (card) => {
  hidePreloader();
  cardList.innerHTML += card;
};
const showPreloader = () => {
  document.querySelector(".preloader").classList.remove("d-none");
};
const hidePreloader = () => {
  document.querySelector(".preloader").classList.add("d-none");
};
// when the predict btn is click
document.getElementById("predict-btn").addEventListener("click", (e) => {
  e.preventDefault();

  if (images.length < 1) return;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(images),
  };

  fetch("/predict", options)
    .then((res) => res.json())
    .then((data) => {
      console.log(data.images);
      showResults(data.images);
    })
    .catch(err => {
      console.log(err);
    })
});
const showResults = (images) => {
  // show the results section
  document.querySelector(".result-section").classList.remove("d-none");

  let carouselItems = "",
    carouselIndicators = "";

  images.forEach((image, index) => {
    // make carousel item and nav item
    const carouselItem = createCarouselItem(image, index);
    const carouselIndicator = createNavItem(index);

    carouselItems += carouselItem;

    // if there is more than one image, display the navigationh with pagination
    if (images.length > 1) {
      carouselIndicators += carouselIndicator;
      document
        .querySelector(".carousel-nav-section")
        .classList.remove("d-none");
      document.querySelector(
        ".carousel-indicators"
      ).innerHTML = carouselIndicators;
    } else {
      document.querySelector(".carousel-nav-section").classList.add("d-none");
    }
  });

  // get the parent carousel
  const parent = document.querySelector(".carousel-inner");

  parent.innerHTML = carouselItems;
};
const createNavItem = (index) => {
  return `
    <li data-target="#carouselExampleIndicators" data-slide-to="${index}"
     class="${index > 0 ? "" : "active"}">
      ${index + 1}
    </li>
  `;
};
const createCarouselItem = (image, index) => {
  return `
    <div class="carousel-item ${index > 0 ? "" : "active"}">
      <div class="row">
        <div class="col-sm-4">
          <img src="${image.URL}" alt="" class="img-fluid" />
        </div>
        <div class="col-sm-8 text-center font-weight-bold">
          <p class="file-name mb-md-4 mb-2">${image.name}</p>
          <p class="prediction-result mt-5">
            This is a
            <span class="result brownish-text" id="result">${image.prediction}</span>
          </p>
        </div>
      </div>
    </div>
    `;
};
