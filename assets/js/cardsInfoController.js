var cardsInfoController = function(generalClient) {
	baseController.call(this, generalClient);

	this.initConstants();
	this.initElements();
	this.initListeners();
};

cardsInfoController.prototype = Object.create(baseController.prototype);

Object.defineProperty(cardsInfoController.prototype, "constructor", {
    value: cardsInfoController,
    enumerable: false,
    writable: true,
});

cardsInfoController.prototype.initConstants = function() {
	var _self = this;

	_self.CARDS_INFO_WRAPPER_CLASS = ".anime-cb-cards-info-card-wrapper";
	_self.CARD_INFO_CLASS = ".anime-cb-cards-info-card";

	_self.CARD_INFO_IMG_ID = "#anime-cb-card-info-card2";
	_self.CARD_INFO_NAME_ID = "#anime-cb-card-info-card-name2";
	_self.CARD_INFO_TEXT_ID = "#anime-cb-card-info-text2";
	_self.FILTER_CARDS_WRAPPER_CLASS = ".anime-cb-cards-info-filters-wrapper";
	_self.FILTER_CARD_NAME_ID = "#filter_card_name";
	_self.FILTER_CARD_TYPE_CLASS = ".anime-cb-cards-info-card-type-checkbox";
	_self.FILTER_CARD_ATTRIBUTE_CLASS = ".anime-cb-cards-info-card-attribute-checkbox";
	_self.FILTERED_CARD_COUNT_CLASS = ".anime-cb-cards-info-filters-cards-count";
};

cardsInfoController.prototype.initElements = function() {
	var _self = this;

	_self.$cards = $(_self.CARDS_INFO_WRAPPER_CLASS).find(_self.CARD_INFO_CLASS);
	_self.$cardAttributes = $(_self.FILTER_CARDS_WRAPPER_CLASS).find(_self.FILTER_CARD_ATTRIBUTE_CLASS);
	_self.$cardTypes = $(_self.FILTER_CARDS_WRAPPER_CLASS).find(_self.FILTER_CARD_TYPE_CLASS);

	$(_self.FILTERED_CARD_COUNT_CLASS).text(_self.$cards.length);
};

cardsInfoController.prototype.initListeners = function() {
	var _self = this;

	_self.$cards.on("mousemove mouseover", function(e) {
 		_self.fillInfoCard(this);
 		_self.handleCardHover.call(_self, e, this);
 		$(this).css("z-index", 2);
	});

	_self.$cards.on("mouseout", function() {
	  $(this).css("transform", "perspective(500px) scale(1) rotateX(0) rotateY(0)");
	  $(this).css("z-index", 1);
	});

	_self.$cards.on("mousedown", function() {
	  $(this).css("transform", "perspective(500px) scale(0.9) rotateX(0) rotateY(0)");
	});

	_self.$cards.on("mouseup", function() {
	  $(this).css("transform", "perspective(500px) scale(1.1) rotateX(0) rotateY(0)");
	});

	$(_self.FILTER_CARD_NAME_ID).on("keyup", function() {
		_self.filterCards();
	});

	$(_self.FILTER_CARD_TYPE_CLASS).on("change", function() {
		_self.filterCards();
	});

	$(_self.FILTER_CARD_ATTRIBUTE_CLASS).on("change", function() {
		_self.filterCards();
	});

	_self.$cards.each(function() {
		var cardSounds = $(this).data("cardSounds");
		var activateEffectsArr = cardSounds.activateEffects;

		if (activateEffectsArr && activateEffectsArr.length > 0) {
			$(this).attr("data-tooltip", "playSound");
			$(this).on("click", function () {
				var randNum = getRandomInt(0, activateEffectsArr.length - 1);
				_self.client.gameController.playSound(activateEffectsArr[randNum]);
			});
		}
	});
};

cardsInfoController.prototype.filterCards = function () {
	var _self = this;

	var filterCardNameValue = $(_self.FILTER_CARD_NAME_ID).val().toLowerCase();
	var cardsFilteredCount = 0;
	_self.$cards.each(function() {
		var cardName = $(this).data("cardName").toLowerCase();
		var cardAttributes = $(this).data("cardAttributes");
		var isContinous = $(this).data("cardEffect").continuous;

		var shouldHide = false;
		if (filterCardNameValue && (!cardName.match(filterCardNameValue))) {
			shouldHide = true;
		}

		_self.$cardAttributes.each(function() {
			if ($(this).prop("checked")) {
				if (!cardAttributes.match($(this).val())) {
					shouldHide = true;
				}
			}
		});

		_self.$cardTypes.each(function() {
			if ($(this).prop("checked")) {
				if ($(this).val() == "continuous") {
					if (!isContinous) {
						shouldHide = true;
					}
				} else if ($(this).val() == "instant") {
					if (isContinous) {
						shouldHide = true;
					}
				}
			}
		});

		if (shouldHide) {
			$(this).hide();
		} else {
			cardsFilteredCount++;
			$(this).show();
		}
	});

	$(_self.FILTERED_CARD_COUNT_CLASS).text(cardsFilteredCount);
};

cardsInfoController.prototype.fillInfoCard = function (card) {
	var _self = this;

	if (!$(card).attr("src")) {
		return;
	}

	var cardRarity = $(card).data("cardRarity") || "";
	var cardText = $(card).data("cardText") || "";
	var cardCost = !isNaN($(card).data("cardCost")) ? $(card).data("cardCost") : undefined
	var cardAttributes = $(card).data("cardAttributes") || "";
	var cardEffect = $(card).data("cardEffect") || "";

	if (cardAttributes) {
		cardAttributes = cardAttributes.split(",");
	}

	cardRarity = cardRarity ? cardRarity.toUpperCase() + ' [' : cardRarity;
	cardCost = !isNaN(cardCost) ? ('<span title="' + cardCost + ' Energy cost">' + cardCost + 'E</span>') : cardCost;

	if ($(card).attr("src") != $(_self.CARD_INFO_IMG_ID).attr("src")) {
  	$(_self.CARD_INFO_IMG_ID).attr("src", $(card).attr("src"));
	}

  $(_self.CARD_INFO_IMG_ID).css("border", "1px solid white");
  $(_self.CARD_INFO_NAME_ID).text($(card).data("cardName") || "");

  var cardHtml = cardRarity;
  cardHtml = cardCost ? cardHtml + cardCost : cardHtml;

  if (cardEffect && cardEffect.effectChargesCount) {
  	cardHtml += ', <span title="Charges count">' + cardEffect.effectChargesCount + 'C</span>';
  }

  cardHtml = cardCost ? (cardHtml + '] &nbsp;') : cardHtml;

  if (cardEffect && cardEffect.continuous) {
  	cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/continuous.png" title="Continuous card">, ';
  }

  if (cardEffect) {
  	cardText = cardText.replace("|X|", cardEffect.effectValue);
  }

  if (cardAttributes) {
	  cardAttributes.forEach(function(cardAttr) {
	  	cardHtml += '<img class="anime-cb-card-info-text-img" src="/imgs/' + cardAttr
	  	+ '_attr.png" title="' + (cardAttr.charAt(0).toUpperCase() + cardAttr.slice(1)) + ' attribute">,';
	  });

	  cardHtml = cardHtml.substring(0, cardHtml.length - 1);
  	cardHtml += '<br>';
	}

  cardHtml += cardText;

  if ($(_self.CARD_INFO_TEXT_ID).html() != cardHtml) {
  	$(_self.CARD_INFO_TEXT_ID).html(cardHtml);
  }
};

cardsInfoController.prototype.handleCardHover = function (e, card) {
	var _self = this;

  const xVal = e.offsetX;
  const yVal = e.offsetY;

  const height = $(card).height();
  const width = $(card).width();

  const yRotation = 20 * ((xVal - width / 2) / width);
  const xRotation = -20 * ((yVal - height / 2) / height);

  const string = 'perspective(500px) scale(1.2) rotateX(' + xRotation + 'deg) rotateY(' + yRotation + 'deg)';

  $(card).css("transform", string);

  _self.fillInfoCard(card);
};

cardsInfoController.prototype.switchCardsImgs = function (haveAnimations) {
	var _self = this;

	_self.$cards.each(function() {
		var card = this;
		if (haveAnimations) {
			if ($(card).data("cardOriginalImage").split('.').pop() == "gif") {
	    	var newSrc = $(card).attr("src").substr(0, $(card).attr("src").lastIndexOf(".")) + ".gif"
	      $(card).attr("src", newSrc);
	    }
		} else {
	    if ($(card).attr("src").split('.').pop() == "gif") {
	    	var newSrc = $(card).attr("src").substr(0, $(card).attr("src").lastIndexOf(".")) + ".jpg"
	      $(card).attr("src", newSrc);
	    }
		}
  });
};