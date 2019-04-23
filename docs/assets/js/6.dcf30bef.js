(window.__LOADABLE_LOADED_CHUNKS__=window.__LOADABLE_LOADED_CHUNKS__||[]).push([[6],{32:function(n,s,a){"use strict";a.r(s);var t=a(1),o=a(68),p=a.n(o);s.default=function(){return t.createElement(p.a,{renderContent:function(){return t.createElement("div",{className:"markdown-body section",dangerouslySetInnerHTML:{__html:'<h2 id="tc39-globalthis">TC39 <code>globalThis</code></h2>\n<blockquote>\n<p> 草案地址: <a href="https://github.com/tc39/proposal-global#html-and-the-windowproxy">Ref</a></p>\n</blockquote>\n<h3 id="故事的开始">故事的开始</h3>\n<p>在9102年的ECMAScript(文后戏称JS)世界里，JS已经不是当年那跑在浏览器里的脚本语言了。我们一拍脑子能想到的运行环境就有：</p>\n<ul>\n<li>浏览器</li>\n<li>Node.js</li>\n<li>根据草案实现的各个<code>Standalone</code>版本（可见此工具的<a href="https://github.com/GoogleChromeLabs/jsvu">README</a></li>\n</ul>\n<p>为了JS可以在不同的<strong>运行环境</strong>下都访问到自己想要的那个全局的<code>this</code>, 于是就有了这个草案，也有了我读了某片博客之后的这篇记录。</p>\n<h3 id="the-polyfill-polyfill">The Polyfill Polyfill</h3>\n<blockquote>\n<p>以下polyfill的思路来自Mathiasbynens的一片<a href="https://mathiasbynens.be/notes/globalthis#naive-polyfill">博客</a></p>\n</blockquote>\n<p>首先，我们分析一下目前JS的几个运行环境;</p>\n<p>浏览器中我们有<code>window</code>对象和<code>frames</code>对象:</p>\n<pre><code class="language-java">globalThis <span class="token operator">==</span><span class="token operator">=</span> window<span class="token punctuation">;</span> <span class="token comment">// true</span>\nglobalThis <span class="token operator">==</span><span class="token operator">=</span> frames<span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>虽然在<code>web wrokers</code>中window为<code>undefined</code>, 但是浏览器扩展中也实现了一个叫做<code>self</code>的对象:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> self<span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>在 Node.js 中也有很熟悉的<code>global</code>对象:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> global<span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>就如同我们文章开头提到的, 还有一些独立的JS实现, 就没有以上这些宿主环境的全局对象。这种情况可以直接去访问全局的<code>this</code>:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> <span class="token keyword">this</span><span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>而且，在sloppy模式(即没有开启严格模式)下，函数的this总是指向全局的this，所以就算我们不能像上一个例子一样在全局环境下直接访问<code>this</code>, 也可以通过一个简单的匿名函数去获得:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> <span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>然鹅，在大部分JS模块标准实现中，最顶层的函数的this一般是<code>undefined</code>，而且函数在严格模式下的<code>this</code>也是<code>undefined</code>, 所以上面这个思路也不行。</p>\n<p>到这个地方，Mathias给了一个特别trick的方法，在严格模式下生成非严格模式的函数：</p>\n<p>使用<code>Function</code>构造器:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> <span class="token function">Function</span><span class="token punctuation">(</span><span class="token string">\'return this\'</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// true</span></code></pre>\n<p>当然使用<code>eval</code>也一样:</p>\n<pre><code class="language-javascript">globalThis <span class="token operator">===</span> <span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> eval<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token string">\'this\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>在现代浏览器中，<code>Funciton</code>构造器和<code>eval</code>通常被<a href="http://www.ruanyifeng.com/blog/2016/09/csp.html">Content Security Policy(CSP)`</a>限制使用。一般网站有选择的遵循这个policy，但在Chrome插件中则是强制遵循。简而言之，这个polyfill并不能通过这种trick的方法来实现。</p>\n<h3 id="a-naive">A Naive</h3>\n<p>根据上文能很快的得到一个这样的实现：</p>\n<pre><code class="language-javascript"><span class="token comment">// Ref: https://mathiasbynens.be/notes/globalthis#naive-polyfill</span>\n<span class="token comment">// A naive globalThis shim. Don’t use this!</span>\n<span class="token keyword">const</span> <span class="token function-variable function">getGlobal</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> globalThis <span class="token operator">!==</span> <span class="token string">\'undefined\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span> globalThis<span class="token punctuation">;</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> self <span class="token operator">!==</span> <span class="token string">\'undefined\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span> self<span class="token punctuation">;</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> window <span class="token operator">!==</span> <span class="token string">\'undefined\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span> window<span class="token punctuation">;</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> global <span class="token operator">!==</span> <span class="token string">\'undefined\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span> global<span class="token punctuation">;</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> <span class="token keyword">this</span> <span class="token operator">!==</span> <span class="token string">\'undefined\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n    <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">\'Unable to locate global object\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token comment">// Note: `var` is used instead of `const` to ensure `globalThis`</span>\n<span class="token comment">// becomes a global variable (as opposed to a variable in the</span>\n<span class="token comment">// top-level lexical scope) when running in the global scope.</span>\n<span class="token keyword">var</span> globalThis <span class="token operator">=</span> <span class="token function">getGlobal</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>这个实现不支持严格模式，非浏览器环境下的一些模块化函数内；</p>\n<h3 id="a-robust-polyfill">A Robust Polyfill</h3>\n<p>那么是否有可能写一个健壮的polyfill实现呢? 在总结如下条件的情况下:</p>\n<ul>\n<li>我们不能依赖环境实现的<code>globalThis</code>, <code>window</code>, <code>self</code>, <code>global</code> 或 <code>this</code>；</li>\n<li>不能使用trick的<code>Function</code>构造器和<code>eval</code>；</li>\n<li>但是你可以仔细考虑一下JS本身所具备的功能。</li>\n</ul>\n<p>下面有这么一个不算漂亮的实现方案；但是在这之前，让我们考虑一些问题：</p>\n<p>我们如何在不考虑<code>globalThis</code>从哪里来的前提下，获取<code>globalThis</code>本身呢? 如果我们可以添任意一个函数在<code>globalThis</code>上，并且我们可以把它当作<code>globalThis</code>的方法来执行，同时它放回的就是<code>this</code>:</p>\n<pre><code class="language-javascript">globalThis<span class="token punctuation">.</span><span class="token function-variable function">foo</span> <span class="token operator">=</span> <span class="token keyword">function</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">var</span> globalThisPolyfilled <span class="token operator">=</span> globalThis<span class="token punctuation">.</span><span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>问题就来了，我们到底如何在不依赖<code>globalThis</code>或者任何环境实现的宿主上绑定这样一个函数呢, 这个条件下我们只能得到下文这样的东西：</p>\n<pre><code class="language-javascript"><span class="token keyword">function</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">var</span> globalThisPolyfilled <span class="token operator">=</span> <span class="token function">foo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p><code>foo()</code>并不是作为某个对象的方法被执行的, 在严格模式，一些模块化的模块函数哪,<code>this</code>理所当然得是<code>undefined</code>。</p>\n<p>然而，作为某个对象的<code>getters</code>, <code>setters</code>就不一样了：</p>\n<pre><code class="language-javascript">Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span>globalThis<span class="token punctuation">,</span> <span class="token string">\'__magic__\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token function-variable function">get</span><span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    configurable<span class="token punctuation">:</span> <span class="token boolean">true</span> <span class="token comment">// 后续可以删除</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token keyword">var</span> globalThisPolyfilled <span class="token operator">=</span> __magic__<span class="token punctuation">;</span>\n<span class="token keyword">delete</span> globalThis<span class="token punctuation">.</span>__magic__<span class="token punctuation">;</span></code></pre>\n<p>我们给现在如果直接给<code>globalThis</code>添加一个<code>getter</code>返回<code>this</code>，这个getter会直接返回当前的<code>this</code>；但是我们根本的问题没有解决，我们还是需要依赖<code>GlobalThis</code>。如何把这个函数安装这样一个全局的<code>getter</code>并且不依赖<code>globalThis</code>呢？</p>\n<p>我们可以把这个<code>getter</code>安装到被全局<code>this</code>继承的<code>Object.prototype</code>上:</p>\n<pre><code class="language-javascript">Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span><span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">,</span> <span class="token string">\'__magic__\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token function-variable function">get</span><span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n    configurable<span class="token punctuation">:</span> <span class="token boolean">true</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">var</span> globalThis <span class="token operator">=</span> __magic__<span class="token punctuation">;</span>\n<span class="token keyword">delete</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span>__magic__<span class="token punctuation">;</span></code></pre>\n<p><strong>⚠️ ECMAScript Spec 并没有强制要求全局的<code>this</code>继承于<code>Object.prototype</code>，如果通过<code>Object.create(null)</code>的方式生成一个全局使用的<code>Object</code>也是可以的，而且 IE7 就是这样做的，幸运的是现代浏览器都是通过<code>Object.prototype</code>继承的</strong></p>\n<p>为了避免浏览器已经实现了<code>globalThis</code>, 我们简单得调整一下:</p>\n<pre><code class="language-javascript"><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> globalThis <span class="token operator">===</span> <span class="token string">\'object\'</span><span class="token punctuation">)</span> <span class="token keyword">return</span><span class="token punctuation">;</span>\n    Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span><span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">,</span> <span class="token string">\'__magic__\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n        <span class="token function-variable function">get</span><span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span><span class="token punctuation">,</span>\n        configurable<span class="token punctuation">:</span> <span class="token boolean">true</span> <span class="token comment">// This makes it possible to `delete` the getter later.</span>\n    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    __magic__<span class="token punctuation">.</span>globalThis <span class="token operator">=</span> __magic__<span class="token punctuation">;</span> <span class="token comment">// lolwat</span>\n    <span class="token keyword">delete</span> <span class="token class-name">Object</span><span class="token punctuation">.</span>prototype<span class="token punctuation">.</span>__magic__<span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token comment">// Your code can use `globalThis` now.</span>\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>globalThis<span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>Mathias在文末说到，这可能是你见过最可怕的Polyfill，因为它完全违背了流行的做法：即不修改不属于你的对象，避免操作内置的原型对象。</p>\n<p><a href="https://mathiasbynens.be/notes/globalthis#testing">通过<code>jsvu</code>测试这个Polyfill</a></p>\n'}})}})}},68:function(n,s,a){"use strict";var t=this&&this.__assign||function(){return(t=Object.assign||function(n){for(var s,a=1,t=arguments.length;a<t;a++)for(var o in s=arguments[a])Object.prototype.hasOwnProperty.call(s,o)&&(n[o]=s[o]);return n}).apply(this,arguments)};s.__esModule=!0;var o=a(25),p=a(14),e=a(69),c=a(1),l=a(1);s.default=e.withRouter(function(n){var s=p.siteData.pages.find(function(s){return s.path===n.match.path})||{path:"",component:""};c.useEffect(function(){s.title&&(console.log(s.title),document.title=s.title)});var a,e=p.layouts[(a="Layout",s.frontmatter&&s.frontmatter.layout&&(a=s.frontmatter.layout),a)];return l.createElement(o.PageDataContext.Provider,{value:s},l.createElement(e,t({},n)))})},69:function(n,s,a){"use strict";a.r(s);var t=a(18);a.d(s,"MemoryRouter",function(){return t.a});var o=a(19);a.d(s,"Prompt",function(){return o.a});var p=a(20);a.d(s,"Redirect",function(){return p.a});var e=a(10);a.d(s,"Route",function(){return e.a});var c=a(6);a.d(s,"Router",function(){return c.a});var l=a(21);a.d(s,"StaticRouter",function(){return l.a});var u=a(22);a.d(s,"Switch",function(){return u.a});var i=a(9);a.d(s,"generatePath",function(){return i.a});var r=a(7);a.d(s,"matchPath",function(){return r.a});var k=a(23);a.d(s,"withRouter",function(){return k.a})}}]);