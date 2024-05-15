// General Item object
function Item(id, name, class) {
    this.id = id;   // Starting from 1
    this.name = name;
    this.class = class;   // 0: Blue, 1: Purple, 2: Red, 3: Yellow, 4: Mystery
}

// General Crate object
function Crate(id, name, items) {
    this.id = id;   // Starting from 1
    this.name = name;
    this.items = items;   // Array with all items to appear in the crate
}

// Individual Items
function Item1(color, certified) {
    this.item = new Item(1, "Item1", 0);
    this.color = color; // 0: standard, 1: white, 2: gray, 3: black, 4: pink, 5: purple, 6: blue, 7: light blue, 8: turquoise, 9: light green, 10: green, 11: yellow, 12: gold, 13: orange, 14: red
    this.certified = certified;
}
function Item2(color, certified) {
    this.item = new Item(2, "Item2", 1);
    this.color = color;
    this.certified = certified;
}
function Item3(color, certified) {
    this.item = new Item(3, "Item3", 2);
    this.color = color;
    this.certified = certified;
}
function Item4(color, certified) {
    this.item = new Item(4, "Item4", 3);
    this.color = color;
    this.certified = certified;
}
function Item5(color, certified) {
    this.item = new Item(5, "Item5", 4);
    this.color = color;
    this.certified = certified;
}


// Variables
var random;
var conveyorBeltItems = [];
var inventory = [];
var conveyorBeltOpen = false;
var rollingBlocked = false;
var itemDetailsOpen = false;

function roll(crate) {
    if(rollingBlocked === false) {
        rollingBlocked = true;
        openConveyorBelt();
        fillConveyorBelt(crate);

        var conveyorBelt = document.getElementById("conveyorBelt");
        conveyorBelt.style.top = "-14000px";

        // Animation
        random = Math.floor((Math.random()*2000)+10000);    // 10000-12000

        var conveyorBeltKeyframes = "@-webkit-keyframes roll_ani {0% {top: -14000px} 100% {top: " + (-14000+random) + "px}}";

        // Add animation
        var conveyorBeltKeyframesTextNode = document.createTextNode(conveyorBeltKeyframes);
        document.getElementsByTagName("style")[0].appendChild(conveyorBeltKeyframesTextNode);

        conveyorBelt.style.webkitAnimationName = "roll_ani";
        conveyorBelt.style.webkitAnimationDuration = "5s";
        conveyorBelt.addEventListener("webkitAnimationEnd", rollEndingListener);
    }
}
function rollEndingListener() {
    rollingBlocked = false;

    // Remove ConveyorBelt animation
    var conveyorBelt = document.getElementById("conveyorBelt");
    conveyorBelt.style.removeProperty("-webkit-animation-name");
    conveyorBelt.style.removeProperty("-webkit-animation-duration");

    // Set current position after animation
    conveyorBelt.style.top = (-14000+random) + "px";

    // Save position
    var position = 14000-random;
    var whichItem = Math.floor((position+350)/200);

    // Add item to inventory
    addItemToInventory(conveyorBeltItems[whichItem]);
    conveyorBelt.removeEventListener("webkitAnimationEnd", rollEndingListener);

    // Animation of the current item (larger div that disappears)
    var biggerDivElem = document.createElement("div");
    biggerDivElem.setAttribute("class", "bigBlock");
    biggerDivElem.style.backgroundColor = document.getElementById("blockNr" + whichItem).style.backgroundColor;
    biggerDivElem.addEventListener("webkitAnimationEnd", function (e) {
        biggerDivElem.parentNode.removeChild(biggerDivElem);
    });
    biggerDivElem.innerHTML = conveyorBeltItems[whichItem].item.name + "<br>";
    switch(conveyorBeltItems[whichItem].color) {
        case 0:
            biggerDivElem.innerHTML += "colorless<br>";
            break;
        case 1:
            biggerDivElem.innerHTML += "<b>white</b><br>";
            break;
        case 2:
            biggerDivElem.innerHTML += "<b style='color: gray'>gray</b><br>";
            break;
        case 3:
            biggerDivElem.innerHTML += "<b style='color: black'>black</b><br>";
            break;
        case 4:
            biggerDivElem.innerHTML += "<b style='color: pink'>pink</b><br>";
            break;
        case 5:
            biggerDivElem.innerHTML += "<b style='color: darkviolet'>purple</b><br>";
            break;
        case 6:
            biggerDivElem.innerHTML += "<b style='color: blue'>blue</b><br>";
            break;
        case 7:
            biggerDivElem.innerHTML += "<b style='color: cornflowerblue'>light blue</b><br>";
            break;
        case 8:
            biggerDivElem.innerHTML += "<b style='color: turquoise'>turquoise</b><br>";
            break;
        case 9:
            biggerDivElem.innerHTML += "<b style='color: lightgreen'>light green</b><br>";
            break;
        case 10:
            biggerDivElem.innerHTML += "<b style='color: green'>green</b><br>";
            break;
        case 11:
            biggerDivElem.innerHTML += "<b style='color: yellow'>yellow</b><br>";
            break;
        case 12:
            biggerDivElem.innerHTML += "<b style='color: gold'>gold</b><br>";
            break;
        case 13:
            biggerDivElem.innerHTML += "<b style='color: orange'>orange</b><br>";
            break;
        case 14:
            biggerDivElem.innerHTML += "<b style='color: red'>red</b><br>";
            break;
    }
    if(conveyorBeltItems[whichItem].certified === 1) {
        biggerDivElem.innerHTML += "certified";
    }

    document.body.appendChild(biggerDivElem);

    // Close ConveyorBelt
    openConveyorBelt();
}

function openConveyorBelt() {
    if(conveyorBeltOpen === false) {
        document.getElementById("conveyorBelt_background").style.display = "inline";
        conveyorBeltOpen = true;
    }
    else {
        document.getElementById("conveyorBelt_background").style.display = "none";
        conveyorBeltOpen = false;
    }
}
function fillConveyorBelt(crate) {
    var divElem;
    var randomClass;

    var items = crate.items;
    var rarity0 = [];
    var rarity1 = [];
    var rarity2 = [];
    var rarity3 = [];
    var rarity4 = [];

    var currentItem;
conveyorBeltItems.splice(0, 75);    // Clear all previous items

for(var j = 0; j < items.length; j++) {
    switch(items[j].item.class) {
        case 0:
            rarity0.push(items[j]);
            break;
        case 1:
            rarity1.push(items[j]);
            break;
        case 2:
            rarity2.push(items[j]);
            break;
        case 3:
            rarity3.push(items[j]);
            break;
        case 4:
            rarity4.push(items[j]);
            break;
    }
}

for(var i = 0; i < 75; i++) {
    // Create block
    divElem = document.createElement("div");
    divElem.setAttribute("id", "blockNr" + i);
    divElem.setAttribute("class", "block");
    document.getElementById("conveyorBelt").appendChild(divElem);
    document.getElementById("blockNr" + i).style.top = 200*i + "px";

    randomClass = Math.floor((Math.random()*100)+1);   // 1-100
    if(randomClass <= 55) {
        document.getElementById("blockNr" + i).style.backgroundColor = "blue";

        currentItem = rarity0[randomItem(rarity0)];
        currentItem.color = randomColor();
        currentItem.certified = certifyItem();
        document.getElementById("blockNr" + i).innerHTML = currentItem.item.name;

        conveyorBeltItems.push(currentItem);
    }
    else if(randomClass <= 83 && randomClass > 55) {
        document.getElementById("blockNr" + i).style.backgroundColor = "mediumpurple";

        currentItem = rarity1[randomItem(rarity1)];
        currentItem.color = randomColor();
        currentItem.certified = certifyItem();
        document.getElementById("blockNr" + i).innerHTML = currentItem.item.name;

        conveyorBeltItems.push(currentItem);
    }
    else if(randomClass <= 95 && randomClass > 83) {
        document.getElementById("blockNr" + i).style.backgroundColor = "red";

        currentItem = rarity2[randomItem(rarity2)];
        currentItem.color = randomColor();
        currentItem.certified = certifyItem();
        document.getElementById("blockNr" + i).innerHTML = currentItem.item.name;

        conveyorBeltItems.push(currentItem);
    }
    else if(randomClass <= 99 && randomClass > 95) {
        document.getElementById("blockNr" + i).style.backgroundColor = "yellow";

        currentItem = rarity3[randomItem(rarity3)];
        currentItem.color = randomColor();
        currentItem.certified = certifyItem();
        document.getElementById("blockNr" + i).innerHTML = currentItem.item.name;

        conveyorBeltItems.push(currentItem);
    }
    else {
        document.getElementById("blockNr" + i).style.backgroundColor = "purple";

        currentItem = rarity4[randomItem(rarity4)];
        currentItem.color = randomColor();
        currentItem.certified = certifyItem();
        document.getElementById("blockNr" + i).innerHTML = currentItem.item.name;

        conveyorBeltItems.push(currentItem);
    }
}
}
function randomItem(rarity) {
    return Math.floor(Math.random()*rarity.length); // Determine item of the rarity class
}
function randomColor() {
    if(Math.floor(Math.random()*4) === 0) {
        return Math.floor(Math.random()*14)+1;    // 1-14
    }
    else {
        return 0;
    }
}
function certifyItem() {
    if(Math.floor(Math.random()*4) === 0) {
        return 1;
    }
    else {
        return 0;
    }
}

// ***** Inventory *****
function addItemToInventory(item) {
    var itemAlreadyInInventory = false;

    for(var i = 0; i < inventory.length; i++) {
        if(inventory[i].item.id === item.item.id) {
            var quantityDiv = document.getElementById("inv_flexItemQuantityID" + item.item.id);
            quantityDiv.innerHTML = (parseInt(quantityDiv.innerHTML)+1).toString();

            itemAlreadyInInventory = true;
            i = inventory.length;
        }
    }

    if(itemAlreadyInInventory === false) {
        var itemDivElem = document.createElement("div");
        itemDivElem.setAttribute("id", "inv_flexItemID" + item.item.id);
        itemDivElem.setAttribute("class", "inv_flexItem");
        itemDivElem.setAttribute("onclick", "openItemDetails(" + item.item.id + ", event)");
        itemDivElem.innerHTML = item.item.name;
        document.getElementById("inv_flexContainer").appendChild(itemDivElem);

        var itemQuantityDivElem = document.createElement("div");
        itemQuantityDivElem.setAttribute("id", "inv_flexItemQuantityID" + item.item.id);
        itemQuantityDivElem.setAttribute("class", "inv_flexItemQuantity");
        itemQuantityDivElem.innerHTML = 1;
        itemDivElem.appendChild(itemQuantityDivElem);

        switch(item.item.class) {
            case 0:
                itemDivElem.style.boxShadow = "0 0 89px -11px rgba(0,168,168)";
                itemDivElem.onmouseover = function (ev) { itemDivElem.style.boxShadow = "0 0 89px 21px rgba(0,168,168)"; };
                itemDivElem.onmouseleave = function (ev) { itemDivElem.style.boxShadow = "0 0 89px -11px rgba(0,168,168)"; };
                break;
            case 1:
                itemDivElem.style.boxShadow = "0 0 89px -11px rgba(128,0,128)";
                itemDivElem.onmouseover = function (ev) { itemDivElem.style.boxShadow = "0 0 89px 21px rgba(128,0,128)"; };
                itemDivElem.onmouseleave = function (ev) { itemDivElem.style.boxShadow = "0 0 89px -11px rgba(128,0,128)"; };
                break;
            case 2:
                itemDivElem.style.boxShadow = "0 0 89px -11px rgba(139,0,0)";
                itemDivElem.onmouseover = function (ev) { itemDivElem.style.boxShadow = "0 0 89px 21px rgba(139,0,0)"; };
                itemDivElem.onmouseleave = function (ev) { itemDivElem.style.boxShadow = "0 0 89px -11px rgba(139,0,0)"; };
                break;
            case 3:
                itemDivElem.style.boxShadow = "0 0 89px -11px rgba(255,215,0)";
                itemDivElem.onmouseover = function (ev) { itemDivElem.style.boxShadow = "0 0 89px 21px rgba(255,215,0)"; };
                itemDivElem.onmouseleave = function (ev) { itemDivElem.style.boxShadow = "0 0 89px -11px rgba(255,215,0)"; };
                break;
            case 4:
                itemDivElem.style.boxShadow = "0 0 89px -11px rgba(128,0,128)";
                itemDivElem.onmouseover = function (ev) { itemDivElem.style.boxShadow = "0 0 89px 21px rgba(128,0,128)"; };
                itemDivElem.onmouseleave = function (ev) { itemDivElem.style.boxShadow = "0 0 89px -11px rgba(128,0,128)"; };
                break;
    }
    inventory.push(item);
}
function openItemDetails(itemId, event) {
    if(itemDetailsOpen === false) {
        itemDetailsOpen = true;

        // Background blur
        document.getElementById("backgroundBlur").style.display = "inline";
        document.getElementById("inventoryBackground").style.display = "inline";

        // Item details
        var itemDetailsDiv = document.createElement("div");
        itemDetailsDiv.setAttribute("id", "itemDetailsDiv");
        itemDetailsDiv.setAttribute("class", "flexItemDetails");
        document.getElementById("inventoryBackground").appendChild(itemDetailsDiv);

        // Close button
        var closeButton = document.createElement("button");
        closeButton.setAttribute("id", "closeButton");
        closeButton.setAttribute("onclick", "closeItemDetails()");
        closeButton.innerHTML = "X";
        document.getElementById("inventoryBackground").appendChild(closeButton);
    }
}
function closeItemDetails() {
    itemDetailsOpen = false;

    // Remove blur
    document.getElementById("backgroundBlur").style.display = "none";
    document.getElementById("inventoryBackground").style.display = "none";

    // Remove item details
    document.getElementById("itemDetailsDiv").remove();
    document.getElementById("closeButton").remove();
}
