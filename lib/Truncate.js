'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Truncate = function (_Component) {
    _inherits(Truncate, _Component);

    function Truncate() {
        var _Object$getPrototypeO;

        var _temp, _this, _ret;

        _classCallCheck(this, Truncate);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Truncate)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.onResize = function () {
            _this.setState({
                targetWidth: null
            }, _this.calcTargetWidth);
        }, _this.calcTargetWidth = function () {
            // Calculation is no longer relevant, since node has been removed
            if (!_this.refs.target) {
                return;
            }

            // Delay calculation until parent node is inserted to the document
            // Mounting order in React is ChildComponent, ParentComponent
            if (!_this.refs.target.parentNode.getBoundingClientRect().width) {
                return requestAnimationFrame(_this.calcTargetWidth);
            }

            _this.refs.target.style.display = 'inline-block';
            _this.refs.target.style.width = '100%';
            _this.refs.target.style.whiteSpace = null;

            var style = window.getComputedStyle(_this.refs.target);
            var targetWidth = _this.refs.target.clientWidth;

            _this.refs.target.style.display = null;
            _this.refs.target.style.width = null;
            _this.refs.target.style.whiteSpace = 'nowrap';

            var font = [style['font-weight'], style['font-style'], style['font-size'], style['font-family']].join(' ');

            _this.canvas.font = font;

            _this.setState({
                targetWidth: targetWidth
            });
        }, _this.measureWidth = function (text) {
            return _this.canvas.measureText(text).width;
        }, _this.renderLine = function (line, i, arr) {
            if (i === arr.length - 1) {
                return _react2.default.createElement(
                    'span',
                    { key: i },
                    line
                );
            } else {
                return [_react2.default.createElement(
                    'span',
                    { key: i },
                    line
                ), _react2.default.createElement('br', { key: i + 'br' })];
            }
        }, _this.styles = {
            raw: {
                display: 'none'
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Truncate, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var canvas = document.createElement('canvas');
            this.canvas = canvas.getContext('2d');

            window.addEventListener('resize', this.onResize);

            this.onResize();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.onResize);
        }
    }, {
        key: 'getLines',
        value: function getLines() {
            var _refs = this.refs;
            var text = _refs.text.textContent;
            var ellipsisText = _refs.ellipsis.textContent;
            var _props = this.props;
            var numLines = _props.lines;
            var ellipsis = _props.ellipsis;
            var targetWidth = this.state.targetWidth;
            var measureWidth = this.measureWidth;


            var lines = [];
            var textWords = text.split(' ');

            for (var line = 1; line <= numLines; line++) {
                var resultLine = textWords.join(' ');

                if (measureWidth(resultLine) < targetWidth) {
                    // Line is end of text and fits without truncating //
                    lines.push(resultLine);
                    break;
                }

                if (line === numLines) {
                    // Binary search determining the longest possible line inluding truncate string //
                    var textRest = textWords.join(' ');

                    var lower = 0;
                    var upper = textRest.length - 1;

                    var testLine = void 0;

                    while (lower <= upper) {
                        var middle = Math.floor((lower + upper) / 2);

                        testLine = textRest.slice(0, middle);

                        if (measureWidth(testLine + ellipsisText) <= targetWidth) {
                            resultLine = _react2.default.createElement(
                                'span',
                                null,
                                testLine,
                                ellipsis
                            );

                            lower = middle + 1;
                        } else {
                            upper = middle - 1;
                        }
                    }
                } else {
                    // Binary search determining when the line breaks //
                    var _lower = 0;
                    var _upper = textWords.length - 1;

                    var _testLine = void 0;
                    var resultMiddle = void 0;

                    while (_lower <= _upper) {
                        var _middle = Math.floor((_lower + _upper) / 2);

                        _testLine = textWords.slice(0, _middle).join(' ');

                        if (measureWidth(_testLine) <= targetWidth) {
                            resultLine = _testLine;
                            resultMiddle = _middle;

                            _lower = _middle + 1;
                        } else {
                            _upper = _middle - 1;
                        }
                    }

                    textWords = textWords.slice(resultMiddle, textWords.length);
                }

                lines.push(resultLine);
            }

            return lines;
        }
    }, {
        key: 'render',
        value: function render() {
            var target = this.refs.target;
            var props = this.props;
            var _props2 = this.props;
            var children = _props2.children;
            var ellipsis = _props2.ellipsis;
            var lines = _props2.lines;


            var text = children;

            if (target && lines > 0) {
                text = this.getLines().map(this.renderLine);
            }

            return _react2.default.createElement(
                'span',
                _extends({}, props, { ref: 'target' }),
                text,
                _react2.default.createElement(
                    'span',
                    { style: this.styles.raw },
                    _react2.default.createElement(
                        'span',
                        { ref: 'text' },
                        children
                    ),
                    _react2.default.createElement(
                        'span',
                        { ref: 'ellipsis' },
                        ellipsis
                    )
                )
            );
        }
    }]);

    return Truncate;
}(_react.Component);

Truncate.propTypes = {
    children: _react2.default.PropTypes.node,
    ellipsis: _react2.default.PropTypes.node,
    lines: _react2.default.PropTypes.number
};
Truncate.defaultProps = {
    children: '',
    ellipsis: '…',
    lines: 1
};
exports.default = Truncate;
;
module.exports = exports['default'];