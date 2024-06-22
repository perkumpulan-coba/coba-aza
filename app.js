const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");

let cart = [];
let buttonsDOM = [];

// Mock data for products
const mockData = {
  "items": [
    {
      "sys": { "id": "1" },
      "fields": {
        "title": "tempat atk dari sedotan",
        "price": 10000,
        "image": { "fields": { "file": { "url": "./images/produk1.jpg" } } }
      }
    },
    {
      "sys": { "id": "2" },
      "fields": {
        "title": "⁠tempat serbaguna dari sedotan",
        "price": 12000,
        "image": { "fields": { "file": { "url": "./images/produk2.jpg" } } }
      }
    },
    {
      "sys": { "id": "3" },
      "fields": {
        "title": "vas bunga kaca",
        "price": 20000,
        "image": { "fields": { "file": { "url": "./images/produk3.jpg" } } }
      }
    },
    {
      "sys": { "id": "4" },
      "fields": {
        "title": "tempat atk dari botol plastik",
        "price": 12000,
        "image": { "fields": { "file": { "url": "./images/produk4.jpg" } } }
      }
    },
    {
      "sys": { "id": "5" },
      "fields": {
        "title": "⁠rak serbaguna paperbowl",
        "price": 20000,
        "image": { "fields": { "file": { "url": "./images/produk5.jpg" } } }
      }
    }
  ]
};

// Function to format prices
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Getting the products
class Products {
  async getProducts() {
    try {
      let products = mockData.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const { url } = item.fields.image.fields.file;
        return { title, price, id, url };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// UI for displaying products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <article class="product">
        <div class="img-container">
          <img
            src=${product.url}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i> add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>Rp${formatPrice(product.price)}</h4>
      </article>
      `;
    });
    productsDom.innerHTML = result;
  }

  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", event => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart in localStorage
          Storage.saveCart(cart);
          // set cart values
          this.setCartValues(cart);
          // display cart items
          this.addCartItem(cartItem);
          // show the cart and create an overlay
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = formatPrice(parseFloat(tempTotal.toFixed(2)));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.url} alt=""/>
    <div>
      <h4>${item.title}</h4>
      <h5>Rp${formatPrice(item.price)}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // cart functionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let btn = this.getSingleButton(id);
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(btn => btn.dataset.id === id);
  }
}

// Local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new UI();
  // Setup application
  ui.setupAPP();
  // Get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
      setupCheckoutButton(); // Call the function to setup checkout button
    });
});


// Function to setup checkout button
function setupCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  console.log("Checkout button setup"); // Debug log

  checkoutBtn.addEventListener("click", () => {
    console.log("Checkout button clicked"); // Debug log

    const total = cartTotal.innerText; // Get total from cart total span
    const whatsappNumber = "6285741709986"; // Your WhatsApp number
    const message = `Halo, saya ingin melakukan checkout. Total yang harus dibayar adalah Rp${total}.`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp link
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  });
}
document.addEventListener('DOMContentLoaded', function() {
  let slideIndex = 0;
  showSlides();

  function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}    
    slides[slideIndex-1].style.display = "block";  
    setTimeout(showSlides, 3000); // Change image every 3 seconds
  }
});
