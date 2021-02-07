var chatController = function(generalClient) {
	var _self = this;

	baseController.call(_self, generalClient);

	_self.initConstants();
	_self.initElements();
	_self.initListeners();
	_self.initIntervals();
};

chatController.prototype = Object.create(baseController.prototype);

Object.defineProperty(chatController.prototype, 'constructor', {
    value: chatController,
    enumerable: false,
    writable: true,
});

chatController.prototype.initConstants = function() {
	var _self = this;

	_self.CHAT_BOX_CLASS = '.anime-cb-chat-box';
	_self.CHAT_INPUT_ID = '#anime-cb-chat-input';
	_self.CHAT_MSG_CLASS = '.anime-cb-chat-msg';
};

chatController.prototype.initElements = function() {
	var _self = this;

	_self._scrollToBottom = true;
};

chatController.prototype.initListeners = function() {
	var _self = this;

	$(_self.CHAT_INPUT_ID).on('keypress', function (e) {
		var key = e.which;

		if (key == 13 && $(_self.CHAT_INPUT_ID).val()) {
			_self.client.sendChatMsg({ msg: $(_self.CHAT_INPUT_ID).val() })
			$(_self.CHAT_INPUT_ID).val("");
		}
	});

  $(_self.CHAT_BOX_CLASS).on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
    	_self._scrollToBottom = true;
    } else {
    	_self._scrollToBottom = false;
    }
	});
};

chatController.prototype.initIntervals = function() {
	var _self = this;
};

chatController.prototype.processChatMsg = function (data) {
	var _self = this;

	if (data.isSuccessful) {
		_self.showChatMsg(data);
	}
};

chatController.prototype.showChatMsg = function (data) {
	var _self = this;

	$(_self.CHAT_BOX_CLASS).append('<span class="anime-cb-chat-msg">' + data.time + ' ' + data.username + ': ' + data.msg + '</span><br>');

	if (_self._scrollToBottom) {
		$(_self.CHAT_BOX_CLASS).scrollTop($(_self.CHAT_BOX_CLASS)[0].scrollHeight);
	}
};