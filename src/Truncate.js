import React, { Component, PropTypes } from 'react';

export default class Truncate extends Component {
    static propTypes = {
        children: PropTypes.node,
        ellipsis: PropTypes.node,
        lines: PropTypes.oneOfType([
            PropTypes.oneOf([false]),
            PropTypes.number
        ])
    };

    static defaultProps = {
        children: '',
        ellipsis: '…',
        lines: 1
    };

    state = {};

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
        this.calcTargetWidth();
    };

    calcTargetWidth = () => {
        let {
            refs: {
                target
            },
            calcTargetWidth,
            canvas
        } = this;

        // Calculation is no longer relevant, since node has been removed
        if (!target) {
            return;
        }

        let targetWidth = target.parentNode.getBoundingClientRect().width;

        // Delay calculation until parent node is inserted to the document
        // Mounting order in React is ChildComponent, ParentComponent
        if (!targetWidth) {
            return requestAnimationFrame(calcTargetWidth);
        }

        let style = window.getComputedStyle(target);

        let font = [
            style['font-weight'],
            style['font-style'],
            style['font-size'],
            style['font-family']
        ].join(' ');

        canvas.font = font;

        this.setState({
            targetWidth
        });
    };

    measureWidth = text => {
        return this.canvas.measureText(text).width;
    };

    getLines = () => {
        let {
            refs: {
                text: {
                    textContent: text
                },
                ellipsis: {
                    textContent: ellipsisText
                }
            },
            props: {
                lines: numLines,
                ellipsis
            },
            state: {
                targetWidth
            },
            measureWidth
        } = this;

        let lines = [];
        let textWords = text.split(' ');

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

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    let testLine = textRest.slice(0, middle + 1);

                    if (measureWidth(testLine + ellipsisText) <= targetWidth) {
                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                resultLine = <span>{textRest.slice(0, lower)}{ellipsis}</span>;
            } else {
                // Binary search determining when the line breaks //
                let lower = 0;
                let upper = textWords.length - 1;

                while (lower <= upper) {
                    let middle = Math.floor((lower + upper) / 2);

                    let testLine = textWords.slice(0, middle + 1).join(' ');

                    if (measureWidth(testLine) <= targetWidth) {
                        lower = middle + 1;
                    } else {
                        upper = middle - 1;
                    }
                }

                // The first word of this line is too long to fit it
                if (lower === 0) {
                    // Jump to processing of last line
                    line = numLines - 1;
                    continue;
                }

                resultLine = textWords.slice(0, lower).join(' ');
                textWords = textWords.slice(lower, textWords.length);
            }

            lines.push(resultLine);
        }

        return lines;
    };

    renderLine = (line, i, arr) => {
        if (i === arr.length - 1) {
            return <span key={i}>{line}</span>;
        } else {
            return [
                <span key={i}>{line}</span>,
                <br key={i + 'br'} />
            ];
        }
    };

    render() {
        let {
            refs: {
                target
            },
            props: {
                children,
                ellipsis,
                lines,
                ...spanProps
            },
            state: {
                targetWidth
            },
            getLines,
            renderLine
        } = this;

        let text = children;

        if (target && targetWidth && lines > 0) {
            text = getLines().map(renderLine);
        }

        return (
            <span {...spanProps} ref='target'>
                {text}
                <span style={this.styles.raw}>
                    <span ref='text'>{children}</span>
                    <span ref='ellipsis'>{ellipsis}</span>
                </span>
            </span>
        );
    }

    styles = {
        raw: {
            display: 'none'
        }
    };
};
