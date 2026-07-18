# Hello, World: Why I'm Blogging On-Site

I write about embedded systems, robotics, and the occasional web experiment on [Medium](https://ibrahimmansur4.medium.com/) — but I wanted a home for shorter, rougher notes that lives on my own site. This page is that home.

## How this blog works

There is no CMS and no database behind this page. Each post is a plain Markdown file in the repo, and a small `posts.json` file acts as the index:

- The blog page fetches `posts.json` and renders the list you came from.
- Opening a post fetches the Markdown file and renders it right in your browser.
- The search box just filters the index by title, tags, and summary — no server involved.

Publishing a new post means dropping in one `.md` file and adding one JSON entry. That's the whole pipeline.

## A code block, to prove it renders

Since most of what I write involves firmware, here's the embedded engineer's version of hello world — a blinking LED on an ESP32:

```c
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

#define LED_PIN GPIO_NUM_2

void app_main(void)
{
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);
    while (1) {
        gpio_set_level(LED_PIN, 1);
        vTaskDelay(pdMS_TO_TICKS(500));
        gpio_set_level(LED_PIN, 0);
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
```

If you can read the code above with syntax-friendly styling, inline code like `vTaskDelay()` looks right, and this list rendered as a list — the pipeline works.

## What to expect here

Shorter posts than my Medium articles: build notes, debugging war stories from medical device firmware, and things I wish I'd found on someone else's blog. The longer, polished guides will keep going to Medium.
