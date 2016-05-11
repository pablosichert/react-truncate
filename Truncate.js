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

    getLines() {
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

        let lines = [];
        let textWords = textSource.split(' ');

        for (let line = 1; line <= numLines; line++) {
            let resultLine = textWords.join(' ');

            if (measureWidth(resultLine) < targetWidth) {
                // Line is end of text and fits without truncating //
                lines.push(resultLine);
                break;
            }

            if (line === numLines) {
                // Binary search determining the longest possible line inluding truncate string //
                let textRest = textWords.join(' ');

                let lower = 0;
                let upper = textRest.length - 1;

                let testLine;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    testLine = textRest.slice(0, middle) + truncateString;

                    if (measureWidth(testLine) <= targetWidth) {
                        resultLine = testLine;

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }
            } else {
                // Binary search determining when the line breaks //
                let lower = 0;
                let upper = textWords.length - 1;

                let testLine;
                let resultMiddle;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    testLine = textWords.slice(0, middle).join(' ');

                    if (measureWidth(testLine) <= targetWidth) {
                        resultLine = testLine;
                        resultMiddle = middle;

                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                textWords = textWords.slice(resultMiddle, textWords.length);
            }

            lines.push(resultLine);
        }

        return lines;
    }

    renderLine(line, i, arr) {
        if (i === arr.length - 1) {
            return <span key={i}>{line}</span>;
        } else {
            return [
                <span key={i}>{line}</span>,
                <br key={i + 'br'} />
            ];
        }
    }

    render() {
        let {
            refs: {
                target
            },
            props,
            props: {
                children: lines
            }
        } = this;

        if (target) {
            lines = this.getLines().map(this.renderLine);
        }

        return (
            <div {...props} ref='target'>
                {lines}
            </div>
        );
    }
};
