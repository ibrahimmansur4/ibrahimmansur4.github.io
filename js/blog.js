// Blog page: post list + search (blog.html) and reader view (blog.html?post=slug).
// Posts are the author's own Markdown committed to this repo, so marked's HTML
// output is trusted and rendered without a sanitizer.
document.addEventListener('DOMContentLoaded', function () {
    var listView = document.getElementById('postListView');
    var readerView = document.getElementById('postReaderView');
    if (!listView || !readerView) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('post');

    if (slug && /^[a-z0-9-]+$/.test(slug)) {
        showReader(slug);
    } else {
        showList();
    }

    function formatDate(iso) {
        // T00:00:00 keeps the date in local time (bare ISO dates parse as UTC)
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function fetchIndex() {
        return fetch('posts/posts.json').then(function (res) {
            if (!res.ok) throw new Error('posts.json ' + res.status);
            return res.json();
        });
    }

    // --- list view ---
    function showList() {
        var listEl = document.getElementById('postList');
        var statusEl = document.getElementById('postListStatus');
        var searchEl = document.getElementById('postSearch');

        fetchIndex().then(function (posts) {
            posts.forEach(function (post) {
                var card = document.createElement('a');
                card.className = 'card post-card reveal visible';
                card.href = 'blog.html?post=' + encodeURIComponent(post.slug);
                card.dataset.search = (post.title + ' ' + post.tags.join(' ') + ' ' + post.summary).toLowerCase();

                var meta = document.createElement('div');
                meta.className = 'post-card-meta';
                var dateEl = document.createElement('span');
                dateEl.className = 'post-date';
                dateEl.textContent = formatDate(post.date);
                meta.appendChild(dateEl);

                var chips = document.createElement('ul');
                chips.className = 'chips';
                post.tags.forEach(function (tag) {
                    var li = document.createElement('li');
                    li.textContent = tag;
                    chips.appendChild(li);
                });
                meta.appendChild(chips);

                var title = document.createElement('h3');
                title.textContent = post.title;

                var summary = document.createElement('p');
                summary.textContent = post.summary;

                var readMore = document.createElement('span');
                readMore.className = 'read-more';
                readMore.innerHTML = 'Read post <i class="fas fa-arrow-right"></i>';

                card.appendChild(meta);
                card.appendChild(title);
                card.appendChild(summary);
                card.appendChild(readMore);
                listEl.appendChild(card);
            });
        }).catch(function () {
            statusEl.textContent = 'Could not load posts. Please try again later.';
            statusEl.hidden = false;
        });

        if (searchEl) {
            searchEl.addEventListener('input', function () {
                var query = searchEl.value.trim().toLowerCase();
                var visible = 0;
                listEl.querySelectorAll('.post-card').forEach(function (card) {
                    var match = !query || card.dataset.search.indexOf(query) !== -1;
                    card.hidden = !match;
                    if (match) visible++;
                });
                statusEl.textContent = 'No posts match your search.';
                statusEl.hidden = visible > 0;
            });
        }
    }

    // --- reader view ---
    function showReader(slug) {
        listView.hidden = true;
        document.getElementById('mediumSection').hidden = true;
        readerView.hidden = false;

        var metaEl = document.getElementById('postMeta');
        var bodyEl = document.getElementById('postBody');

        Promise.all([
            fetchIndex(),
            fetch('posts/' + slug + '.md').then(function (res) {
                if (!res.ok) throw new Error(slug + '.md ' + res.status);
                return res.text();
            })
        ]).then(function (results) {
            var post = results[0].find(function (p) { return p.slug === slug; });
            var markdown = results[1];

            if (post) {
                document.title = post.title + ' — Ibrahim Bin Mansur';
                var dateEl = document.createElement('span');
                dateEl.className = 'post-date';
                dateEl.textContent = formatDate(post.date);
                metaEl.appendChild(dateEl);

                var chips = document.createElement('ul');
                chips.className = 'chips';
                post.tags.forEach(function (tag) {
                    var li = document.createElement('li');
                    li.textContent = tag;
                    chips.appendChild(li);
                });
                metaEl.appendChild(chips);
            }

            bodyEl.innerHTML = marked.parse(markdown);
        }).catch(function () {
            bodyEl.innerHTML = '<h1>Post not found</h1><p>This post doesn\'t exist (or failed to load). <a href="blog.html">Back to all posts</a>.</p>';
        });
    }
});
