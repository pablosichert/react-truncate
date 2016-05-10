import React, { Component } from 'react';

export default class Truncate extends Component {
    static propTypes = {
        children: React.PropTypes.string,
        truncate: React.PropTypes.string,
        lines: React.PropTypes.number
    };

    static defaultProps = {
        children: '',
        truncate: '…',
        lines: 1
    };

    componentDidMount() {
        let canvas = document.createElement('canvas');
        this.canvas = canvas.getContext('2d');

        window.addEventListener('resize', this.onResize);

        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
        let style = window.getComputedStyle(this.refs.target);
        let font = [
            style['font-weight'],
            style['font-style'],
            style['font-size'],
            style['font-family']
        ].join(' ');

        this.canvas.font = font;

        this.setState({
            targetWidth: style.width.split('px')[0]
        });
    };

    measureWidth = text => {
        return this.canvas.measureText(text).width;
    };

    getTextTruncated() {
        let {
            props: {
                children: textSource,
                lines: numLines,
                truncate: truncateString
            },
            state: {
                targetWidth
            },
            measureWidth
        } = this;

        let textRest = textSource;
        let textTruncated = '';

        for (let line = 1; line <= numLines; line++) {
            let textLine;

            if (measureWidth(textRest) < targetWidth) {
                // Line is end of text and fits without truncating //
                textTruncated += textRest;
                break;
            }

            if (line === numLines) {
                // Binary search determining the longest possible line inluding truncate string //
                let lower = 0;
                let upper = textRest.length - 1;
                let result;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    textLine = textRest.slice(0, middle) + truncateString;
                    let textWidth = measureWidth(textLine);

                    if (textWidth <= targetWidth) {
                        result = textLine;

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                textLine = result;
            } else {
                // Binary search determining when the line breaks //
                let words = textRest.split(' ');

                let lower = 0;
                let upper = words.length - 1;
                let result;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    textLine = words.slice(0, middle).join(' ');
                    let textWidth = measureWidth(textLine);

                    if (textWidth <= targetWidth) {
                        result = textLine + ' ';

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                textLine = result;
            }

            textTruncated += textLine;
            textRest = textRest.slice(textLine.length, textRest.length);
        }

        return textTruncated;
    }

    render() {
        let {
            refs: {
                target
            },
            props,
            props: {
                children: text
            }
        } = this;

        if (target) {
            text = this.getTextTruncated();
        }

        return (
            <div {...props} ref='target'>
                {text}
            </div>
        );
    }
};
