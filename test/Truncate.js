import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedDOM from 'unexpected-dom';
import sinon from 'sinon';
import jsdom from 'jsdom';
import requestAnimationFrame, { cancel as cancelAnimationFrame } from 'raf';
import React, { Component } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { renderIntoDocument } from 'react-dom/test-utils';
import ShallowRenderer from 'react-test-renderer/shallow';
import { stripIndent } from 'common-tags';

import Truncate from '../src/Truncate';

const expect = unexpected.clone()
    .use(unexpectedReact)
    .use(unexpectedSinon)
    .addAssertion('<spyCall> to have arguments <any*>', (expect, subject, ...args) => {
        return expect(subject, 'to satisfy', { args });
    })
    .use(unexpectedDOM)
    .addAssertion('<DOMElement> to display text <string>', (expect, subject, value) => {
        function nodeToText(node) {
            const textNode = node.children[0];

            return Array.prototype.reduce.call(textNode.children, (prev, curr) => {
                if (curr.style.visibility === 'hidden') {
                    return prev;
                }

                if (curr instanceof global.window.HTMLBRElement) {
                    return prev += '\n';
                }

                return prev += curr.textContent;
            }, '');
        }

        return expect(nodeToText(subject), 'to equal', stripIndent`${value}`);
    })
;

const characterWidth = 6; // px
const measureWidth = text => text.length * characterWidth;
const offsetHeightStub = sinon.stub().returns(1);

describe('<Truncate />', () => {
    it('should be a React component', () => {
        expect(Truncate, 'to be a', Component.constructor);
    });

    it('should render a span', () => {
        const renderer = new ShallowRenderer();
        renderer.render(<Truncate />);

        expect(renderer, 'to have rendered', <span />);
    });

    describe('in a server environment', () => {
        it('should render initial static markup', async () => {
            const markup = renderToString(
                <Truncate
                    lines={2}
                    ellipsis='…'
                    onTruncate={() => {}}
                >
                    Some text inside of here
                </Truncate>
            );

            const captures = await expect(
                markup, 'to match', /Some text inside of here/g
            );

            expect(captures.length, 'to be', 1);
        });
    });

    describe('in a client environment', () => {
        before(() => {
            const { JSDOM } = jsdom;
            const { document } = (new JSDOM('')).window;
            global.document = document;
            global.window = global.document.defaultView;
            global.window.requestAnimationFrame = requestAnimationFrame;
            global.window.cancelAnimationFrame = cancelAnimationFrame;
            Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
                configurable: true,
                get() {
                    let text = '';

                    for (const node of this.childNodes) {
                        if (node instanceof global.window.HTMLBRElement) {
                            text += '\n';
                            continue;
                        }

                        if (node instanceof global.window.Comment) {
                            continue;
                        }

                        const {
                            nodeValue
                        } = node;

                        if (nodeValue !== undefined) {
                            text += nodeValue;
                        }
                    }

                    return text;
                }
            });

            // offset height is always 0 in jsdom world, so need to stub it out
            Object.defineProperties(global.window.HTMLSpanElement.prototype, {
                offsetHeight: {
                    get: offsetHeightStub
                }
            });

            for (const key in global.window) {
                if (!global[key]) {
                    global[key] = global.window[key];
                }
            }
        });

        beforeEach(() => {
            offsetHeightStub.returns(1);
        });

        // Mock out a box that's 16 characters wide
        const numCharacters = 16;
        const width = numCharacters * characterWidth;

        describe(`with a box of ${width}px mocked out`, () => {
            const renderIntoBox = component => renderIntoDocument(
                <div>
                    {component}
                </div>
            ).children[0];

            before(() => {
                sinon.stub(global.window.HTMLDivElement.prototype, 'getBoundingClientRect')
                    .callsFake(() => ({width}));

                sinon.stub(Truncate.prototype, 'measureWidth')
                    .callsFake(text => measureWidth(text));

                // Approximate .offsetWidth
                sinon.stub(Truncate.prototype, 'ellipsisWidth')
                    .callsFake(node => measureWidth(node.textContent));
            });

            after(() => {
                global.window.HTMLDivElement.prototype.getBoundingClientRect.restore();

                Truncate.prototype.measureWidth.restore();
                Truncate.prototype.ellipsisWidth.restore();
            });

            it('should truncate text', () => {
                const component = renderIntoBox(
                    <Truncate lines={2} ellipsis='…'>
                        This text should
                        stop after here
                        and not contain the
                        next lines
                    </Truncate>
                );

                expect(component, 'to display text', `
                    This text should
                    stop after here…
                `);
            });

            it('should preserve newlines', () => {
                const component = renderIntoBox(
                    <Truncate lines={4}>
                        This text
                        contains<br />
                        <br />
                        newlines
                    </Truncate>
                );

                expect(component, 'to display text', `
                    This text
                    contains

                    newlines
                `);
            });

            it("should not add empty lines when text doesn't fill all lines", () => {
                const component = renderIntoBox(
                    <Truncate lines={4}>
                        Some short text
                        over here
                    </Truncate>
                );

                expect(component, 'to display text', `
                    Some short text
                    over here
                `);
            });

            it('should not truncate at all if specified in lines prop', () => {
                const Content = props => (
                    <span>
                        Preserve this text
                        as it was!
                    </span>
                );

                const Wrapper = class extends Component {
                    render() {
                        return (
                            <Truncate lines={false}>
                                <Content />
                            </Truncate>
                        );
                    }
                };

                const component = renderIntoDocument(<Wrapper />);

                expect(component, 'to contain', (
                    <span>
                        <span><Content /></span>
                        <span><Content /></span>
                    </span>
                ));
            });

            it('should end truncating when a single word is bigger than its line', () => {
                const component = renderIntoBox(
                    <Truncate lines={2} ellipsis='…'>
                        Thereisasuperlongwordinthefirstline
                        so that the next lines won't be
                        visible
                    </Truncate>
                );

                expect(component, 'to display text', `
                    Thereisasuperlo…
                `);
            });

            it('should be able to use a react component as ellipsis', () => {
                const component = renderIntoBox(
                    <Truncate lines={2} ellipsis={<a href='#'>… read more</a>}>
                        I'm curious what
                        the next lines of
                        text will say!
                    </Truncate>
                );

                expect(component, 'to display text', `
                    I'm curious what
                    the n… read more
                `);
            });

            it('should update content when new children are passed in', () => {
                const container = document.createElement('div');

                const component = render(
                    <div>
                        <Truncate lines={1}>
                            Some old content here
                        </Truncate>
                    </div>,
                    container
                );

                expect(component, 'to display text', `
                    Some old conten…
                `);

                render(
                    <div>
                        <Truncate lines={1}>
                            Some new content here
                        </Truncate>
                    </div>,
                    container
                );

                expect(component, 'to display text', `
                    Some new conten…
                `);
            });

            it('should render without an error when the last line is exactly as wide as the container', () => {
                const render = () => renderIntoDocument(
                    <div>
                        <Truncate lines={2}>
                            {new Array(numCharacters).fill('a').join()}
                        </Truncate>
                    </div>
                );

                expect(render, 'not to throw');
            });

            describe('with trimWhitespace', () => {
                it('should remove whitespace from before the ellipsis', () => {
                    const component = renderIntoBox(
                        <Truncate lines={3} trimWhitespace>
                            This text
                            contains<br />
                            <br />
                            newlines
                        </Truncate>
                    );

                    expect(component, 'to display text', `
                        This text
                        contains…
                    `);
                });

                it('should render empty text without an error', () => {
                    const container = document.createElement('div');

                    const component = render(
                        <div>
                            <Truncate lines={1} trimWhitespace />
                        </div>,
                        container
                    );

                    expect(component, 'to display text', '');
                });

                it('should truncate whitespace only text without an error', () => {
                    const container = document.createElement('div');

                    const component = render(
                        <div>
                            <Truncate lines={1} trimWhitespace>
                                <br />
                                <br />
                                <br />
                                <br />
                                <br />
                            </Truncate>
                        </div>,
                        container
                    );

                    expect(component, 'to display text', '…');
                });
            });

            describe('onTruncate', () => {
                describe('with Truncate.prototype.onTruncate mocked out', () => {
                    before(() => {
                        // Stub the onTruncate function in a synchronous manner
                        sinon.stub(Truncate.prototype, 'onTruncate').callsFake(function (didTruncate) {
                            const {
                                onTruncate
                            } = this.props;

                            if (typeof onTruncate === 'function') {
                                onTruncate(didTruncate);
                            }
                        });
                    });

                    after(() => {
                        Truncate.prototype.onTruncate.restore();
                    });

                    it('should call with true when text was truncated', () => {
                        const handleTruncate = sinon.spy();

                        renderIntoBox(
                            <Truncate onTruncate={handleTruncate}>
                                Some text over
                                here that got
                                truncated
                            </Truncate>
                        );

                        expect(handleTruncate.lastCall, 'to have arguments', true);
                    });

                    describe('should call with false when text was not truncated because', () => {
                        it('was disabled with lines prop', () => {
                            const handleTruncate = sinon.spy();

                            renderIntoBox(
                                <Truncate lines={false} onTruncate={handleTruncate}>
                                    Some text over
                                    here that is not
                                    truncated
                                </Truncate>
                            );

                            expect(handleTruncate.lastCall, 'to have arguments', false);
                        });

                        it('has shorter text than lines allow', () => {
                            const handleTruncate = sinon.spy();

                            renderIntoBox(
                                <Truncate lines={3} onTruncate={handleTruncate}>
                                    Some text over
                                    here that is not
                                    truncated
                                </Truncate>
                            );

                            expect(handleTruncate.lastCall, 'to have arguments', false);
                        });
                    });
                });

                it('should invoke asynchronously', async () => {
                    const nextFrame = () => new Promise(resolve =>
                        requestAnimationFrame(resolve)
                    );

                    const handleTruncate = sinon.spy();

                    renderIntoBox(
                        <Truncate onTruncate={handleTruncate} />
                    );

                    expect(handleTruncate, 'was not called');

                    await nextFrame();

                    expect(handleTruncate, 'was called');
                });
            });
        });

        it('should set isVisible to false when parent node not visible on page', () => {
            offsetHeightStub.returns(0);

            const component = renderIntoDocument(
                <Truncate>
                    Sample text
                </Truncate>
            );

            expect(component.state.isVisible, 'to equal', false);
        });

        it('should set isVisible to true when parent node not visible on page', () => {
            offsetHeightStub.returns(1);

            const component = renderIntoDocument(
                <Truncate>
                    Sample text
                </Truncate>
            );

            expect(component.state.isVisible, 'to equal', true);
        });

        it('should recalculate when resizing the window', () => {
            const calcTargetWidth = sinon.spy(Truncate.prototype, 'calcTargetWidth');

            try {
                renderIntoDocument(<Truncate />);

                const numCalled = calcTargetWidth.callCount;

                window.dispatchEvent(new window.Event('resize'));

                expect(calcTargetWidth, 'was called times', numCalled + 1);
            } finally {
                Truncate.prototype.calcTargetWidth.restore();
            }
        });

        it('should clean up all event listeners on window when unmounting', () => {
            const events = new Set();

            sinon.stub(window, 'addEventListener').callsFake((name, handler) => {
                events.add({
                    name,
                    handler
                });
            });

            sinon.stub(window, 'removeEventListener').callsFake((name, handler) => {
                for (const event of events) {
                    if (event.name === name && event.handler === handler) {
                        events.delete(event);
                    }
                }
            });

            try {
                const container = document.createElement('div');

                render(<Truncate />, container);

                unmountComponentAtNode(container);

                expect(events.size, 'to be', 0);
            } finally {
                window.addEventListener.restore();
                window.removeEventListener.restore();
            }
        });

        describe('innerText', () => {
            describe('browser implements \\n for <br/>', () => {
                it('should have newlines only at <br/>', () => {
                    const node = document.createElement('div');
                    node.innerHTML = 'foo<br/>bar\nbaz';

                    expect(Truncate.prototype.innerText(node), 'to be', 'foo\nbar baz');
                });
            });

            describe('browser implements "" for <br/>', () => {
                before(() => {
                    Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
                        configurable: true,
                        get() {
                            let text = '';

                            for (const node of this.childNodes) {
                                if (node instanceof global.window.HTMLBRElement) {
                                    text += '';
                                    continue;
                                }

                                if (node instanceof global.window.Comment) {
                                    continue;
                                }

                                const {
                                    nodeValue
                                } = node;

                                if (nodeValue !== undefined) {
                                    text += nodeValue;
                                }
                            }

                            return text;
                        }
                    });
                });

                it('should have newlines only at <br/>', () => {
                    const node = document.createElement('div');
                    node.innerHTML = 'foo<br/>bar\nbaz';

                    expect(Truncate.prototype.innerText(node), 'to be', 'foo\nbar baz');
                });
            });
        });
    });

    describe('ellipsisWidth', () => {
        it('should equal node.offsetWidth', () => {
            const offsetWidth = () => 123;

            const node = {};

            Object.defineProperty(node, 'offsetWidth', {
                get: offsetWidth
            });

            expect(Truncate.prototype.ellipsisWidth(node), 'to be', 123);
        });
    });

    describe('trimRight', () => {
        it('should remove whitespace from the end of text', () => {
            expect(Truncate.prototype.trimRight('some spaces here  '), 'to be', 'some spaces here');
            expect(Truncate.prototype.trimRight('some other whitespace here  \r\n'), 'to be', 'some other whitespace here');
            expect(Truncate.prototype.trimRight('\n  '), 'to be', '');
        });

        it('should leave other text unchanged', () => {
            expect(Truncate.prototype.trimRight('  whitespace on the left'), 'to be', '  whitespace on the left');
            expect(Truncate.prototype.trimRight(' just a \n lot of text really'), 'to be', ' just a \n lot of text really');
        });
    });
});
