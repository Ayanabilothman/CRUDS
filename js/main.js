let labels = document.querySelectorAll('label');
let inputs = document.querySelectorAll('input');
let placeholder;

for (let i = 0; i < inputs.length; i++) {

    inputs[i].addEventListener('focus', function (e) { //we can't use this beacuse the eventlistener is placed before the function calling
        placeholder = e.target.placeholder;
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].htmlFor === e.target.id) {
                labels[i].style.display = "block";
                labels[i].classList.add("top-label")
                break;
            }
        }

        e.target.placeholder = "";
        e.target.parentElement.style.position = "relative";
    })

    inputs[i].addEventListener('blur', function (e) {
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].htmlFor === e.target.id) {
                labels[i].style.display = "none";
                labels[i].classList.remove("top-label")
                break;
            }
        }

        e.target.placeholder = placeholder;
        e.target.parentElement.style.position = "static";
    })

}

///////////////////////////////////////////////////////////////////////////

let productName = document.querySelector('#name');
let productPrice = document.querySelector('#price');
let productDesc = document.querySelector('#desc');
let productCategory = document.querySelector('#category');
let productImage = document.querySelector('#img');
let inputsArr = [productName, productPrice, productDesc, productCategory, productImage]

let productBtn = document.querySelector('#product-btn');
let deleteAllBtn = document.querySelector('#delete-all-btn');
let tableBody = document.querySelector('tbody');
let successAdd = document.querySelector('.success-add');
let errorDiv = document.querySelector('.error');
let overlay = document.querySelector('.overlay');
let overlayImg = document.querySelector(".overlay-img img");
let html = document.querySelector('html');
let closeBtn = document.querySelector('.close-img i');

//prevent user to type spaces or e or + and - in the number input
// 0 for null values
// 8 for backspace 
// 48-57 for 0-9 numbers
productPrice.addEventListener("keypress", function (e) {
    if (e.which != 8 && e.which != 0 && e.which < 48 || e.which > 57)
    {
        e.preventDefault();
    }
});

let products;
let product = {};
getStorage();
display();

// Get products from LocalStorage & Update the products letiable
function getStorage() {
    products = JSON.parse(localStorage.getItem("products")) || []; 
}

// Update the values in the localStorage
function updateStorage() {
    localStorage.setItem("products", JSON.stringify(products));
}

// Check if any of the inputs is Empty
// return: true or false
function validate() {
    let nameValue = productName.value;
    let priceValue = Number(productPrice.value);
    let descValue = productDesc.value;
    let categoryValue = productCategory.value;
    let imgValue = productImage.value;

    if (nameValue == "" || priceValue === ""  || descValue == "" || categoryValue == ""  || imgValue == "") {
        return false;
    } else {
        return true;
    }
}

// Add or Update a product in the localStorage and then displays it in the table.
function addProduct() {
    getStorage();

    // The inputs aren't empty
    if (validate()) {

        //Add New Product
        if (productBtn.innerHTML == "Add Product") {
            product.name = productName.value
            product.price = productPrice.value
            product.description = productDesc.value
            product.category = productCategory.value

            var reader = new FileReader();
            reader.readAsDataURL(productImage.files[0]);
            reader.addEventListener('load', () => {
                product["image"] = reader.result;
                products.push(product);
                updateStorage();
                display();
                clearForm();
            })
            showSuccessDiv();
            window.scrollTo(0, document.body.scrollHeight);

            inputsArr.forEach((input) => {
                input.onfocus = hideSuccessDiv;
            })
        } 
        //Update existing Product
        else {
            let updatedProduct = products[productBtn.dataset.productid]
            updatedProduct.name = productName.value
            updatedProduct.price = productPrice.value
            updatedProduct.description = productDesc.value
            updatedProduct.category = productCategory.value

            var reader = new FileReader();
            reader.readAsDataURL(productImage.files[0]);
            reader.addEventListener('load', () => {
                updatedProduct["image"] = reader.result;
                updateStorage();
                display();
                clearForm();
            })

            productBtn.innerHTML = "Add Product";
            productBtn.classList.replace("btn-dark", "btn-primary");
        }

    } 
    // One of the inputs is empty
    else {
        errorDiv.classList.remove('d-none');
        errorDiv.innerHTML = "All inputs are required!";
        productBtn.classList.add('d-none');

        inputsArr.forEach((input) => {
            input.onfocus = displayProductBtn;
        })
    }
}

// Get the products from the localStorage and display them in the table.
function display() {
    tableBody.innerHTML = '';
    hideDelBtn();
    
    if(products.length > 0) {
        var productLength = Object.keys(products[0]).length;
        var productKeys = Object.keys(products[0]);

        var trFragment = document.createDocumentFragment();
        for (let i = 0; i < products.length; i++) {

            let product = products[i];

            var tr = document.createElement('tr');
            tr.id = i;
            trFragment.appendChild(tr);

            var tdFragment = document.createDocumentFragment();
            // td for id
            var td = document.createElement('td');
            td.innerHTML = i+1;
            tdFragment.appendChild(td);
            for (var j = 0; j < productLength - 1; j++) {
                var td = document.createElement('td');
                td.innerHTML = product[productKeys[j]];
                tdFragment.appendChild(td);
            }

            // td for image
            var td = document.createElement('td');
            td.classList.add("product-img");
            tdFragment.appendChild(td);

            // td for delete
            var td = document.createElement('td');
            td.classList.add("delete");
            tdFragment.appendChild(td);

            // td for update
            var td = document.createElement('td');
            td.classList.add("update");
            tdFragment.appendChild(td);


            tr.appendChild(tdFragment);
            tableBody.appendChild(trFragment);
        }
        addActionBtns();
        addImageBtns();
        showDelBtn();
    } 
}

// Add view image buttons for each product in the table.
function addImageBtns() {
    let tdImages = document.querySelectorAll('.product-img');

    tdImages.forEach((td) => {
        let imgBtn = document.createElement('button');
        imgBtn.classList.add('btn', 'btn-info');
        imgBtn.innerHTML = "Show Image";
        td.appendChild(imgBtn);

        let productID = td.parentElement.id;

        imgBtn.addEventListener('click', function () {
            displayImage(productID);
            hideSuccessDiv();
        });
    })
}

// Add delete and update buttons for each product in the table.
function addActionBtns() {
    let tdDelete = document.querySelectorAll('.delete');
    let tdUpdate = document.querySelectorAll('.update');

    tdDelete.forEach((td) => {
        let delBtn = document.createElement('button');
        delBtn.classList.add('btn', 'btn-danger');
        delBtn.innerHTML = "Delete";

        var productID = td.parentElement.id;
        delBtn.addEventListener('click', () => {
            deleteProduct(productID);
            hideSuccessDiv();
        });

        td.appendChild(delBtn);
    })

    tdUpdate.forEach((td) => {
        let updateBtn = document.createElement('button');
        updateBtn.classList.add('btn', 'btn-dark');
        updateBtn.innerHTML = "Update";

        var productID = td.parentElement.id;
        updateBtn.addEventListener('click', () => {
            updateProduct(productID);
            hideSuccessDiv();
        });
        td.appendChild(updateBtn);
    })
}

// Delete single product.
function deleteProduct(i) {
    getStorage();
    console.log(products.length)
    products.splice(i, 1);
    console.log(products.length)
    updateStorage();
    console.log(products.length)
    display(); 
    console.log(products.length)
}

// Update single product.
function updateProduct(i) {
    getStorage();
    let requiredProduct = products[i];
    productName.value = requiredProduct.name;
    productPrice.value = requiredProduct.price;
    productDesc.value = requiredProduct.description;
    productCategory.value = requiredProduct.category;

    productBtn.innerHTML = "Update Product";
    productBtn.classList.replace('btn-primary', 'btn-dark')
    productBtn.dataset.productid = i;

    let productTr = document.getElementById(`${i}`);
    console.log(productTr)
    productTr.classList.add("table-active");
    window.scrollTo(0, 0);
}

// Set the input values to be empty.
function clearForm() {
    productName.value = "";
    productPrice.value = "";
    productDesc.value = "";
    productCategory.value = "";
    productImage.value = "";
}

// Display the btn of adding or updating a product after the error message.
function displayProductBtn() {
    errorDiv.classList.add('d-none');
    productBtn.classList.remove('d-none');
}

// display the image uploaded by the user.
function displayImage(i) {
    getStorage();
    let imgSrc = products[i].image;
    overlayImg.src = imgSrc;
    overlay.style.display = "flex";
    html.style.overflow = "hidden";
};

// Close the image opened by the user
function closeImage() {
    overlay.style.display = "none";
    html.style.width = "auto";
    html.style.overflow = "visible";
}

// Show "Delete All" Button
function showDelBtn() {
    deleteAllBtn.classList.remove('d-none');
}

// Hide "Delete All" Button
function hideDelBtn() {
    deleteAllBtn.classList.add('d-none');
}

// Show "Product addedd successfully".
function showSuccessDiv() {
    successAdd.classList.remove('d-none');
}

// Hide "Product addedd successfully".
function hideSuccessDiv() {
    successAdd.classList.add('d-none');
}

// Delete all products.
function deleteAll() {
    localStorage.clear();
    getStorage();
    display();
}

productBtn.addEventListener('click', addProduct);
deleteAllBtn.addEventListener('click', deleteAll);
closeBtn.addEventListener('click', closeImage);
