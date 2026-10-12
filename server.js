const http = require("http");

const fs = require("fs");

const path = require("path");

const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

function sendJSON(res, status, data) {

    res.writeHead(status, {

        "Content-Type": "application/json; charset=utf-8"

    });

    res.end(JSON.stringify(data));

}

function readItems(callback) {

    fs.readFile(DATA_FILE, "utf8", function (err, text) {

        if (err) {

            callback(err, null);

            return;

        }

        try {

            const items = JSON.parse(text);

            callback(null, items);

        } catch (error) {

            callback(error, null);

        }

    });

}

function writeItems(items, callback) {

    const text = JSON.stringify(items, null, 2);

    fs.writeFile(DATA_FILE, text, "utf8", callback);

}

function readBody(req, callback) {

    let body = "";

    req.on("data", function (chunk) {

        body += chunk;

    });

    req.on("end", function () {

        try {

            const data = JSON.parse(body);

            callback(null, data);

        } catch (error) {

            callback(error, null);

        }

    });

    req.on("error", function (error) {

        callback(error, null);

    });

}

const server = http.createServer(function (req, res) {

    const url = new URL(

        req.url,

        "http://localhost:" + PORT

    );

    // Главная страница API

    if (req.method === "GET" && url.pathname === "/") {

        sendJSON(res, 200, {

            message: "VINYL STORE API",

            description: "Каталог виниловых пластинок",

            routes: [

                "GET /",

                "GET /items",

                "GET /items?artist=Pink%20Floyd",

                "GET /items?genre=Rock",

                "GET /items/1",

                "POST /items"

            ]

        });

        return;

    }

    // Добавление новой пластинки

    if (req.method === "POST" && url.pathname === "/items") {

        readBody(req, function (err, newItem) {

            if (

                err ||

                !newItem ||

                typeof newItem !== "object" ||

                Array.isArray(newItem) ||

                typeof newItem.title !== "string" ||

                !newItem.title.trim() ||

                typeof newItem.artist !== "string" ||

                !newItem.artist.trim() ||

                newItem.year === undefined ||

                newItem.price === undefined ||

                typeof newItem.genre !== "string" ||

                !newItem.genre.trim()

            ) {

                sendJSON(res, 400, {

                    error: "Заполните поля title, artist, year, price и genre"

                });

                return;

            }

            readItems(function (readError, items) {

                if (readError || !Array.isArray(items)) {

                    sendJSON(res, 500, {

                        error: "Не удалось прочитать данные"

                    });

                    return;

                }

                let maxId = 0;

                items.forEach(function (item) {

                    if (Number(item.id) > maxId) {

                        maxId = Number(item.id);

                    }

                });

                const item = {

                    id: maxId + 1,

                    title: newItem.title.trim(),

                    artist: newItem.artist.trim(),

                    year: newItem.year,

                    price: newItem.price,

                    condition: newItem.condition || "Не указано",

                    genre: newItem.genre.trim()

                };

                items.push(item);

                writeItems(items, function (writeError) {

                    if (writeError) {

                        sendJSON(res, 500, {

                            error: "Не удалось сохранить данные"

                        });

                        return;

                    }

                    sendJSON(res, 201, item);
                    });

            });

        });

        return;

    }

    // Все пластинки и фильтрация

    if (req.method === "GET" && url.pathname === "/items") {

        readItems(function (err, items) {

            if (err || !Array.isArray(items)) {

                sendJSON(res, 500, {

                    error: "Не удалось прочитать данные"

                });

                return;

            }

            let result = items;

            url.searchParams.forEach(function (value, key) {

                result = result.filter(function (item) {

                    if (item[key] === undefined) {

                        return false;

                    }

                    return String(item[key]).toLowerCase() ===

                        value.toLowerCase();

                });

            });

            sendJSON(res, 200, result);

        });

        return;

    }

    // Одна пластинка по ID

    if (req.method === "GET" && url.pathname.startsWith("/items/")) {

        const parts = url.pathname.split("/");

        const id = Number(parts[2]);

        if (!parts[2] || !Number.isInteger(id) || id < 1) {

            sendJSON(res, 404, {

                error: "Пластинка не найдена"

            });

            return;

        }

        readItems(function (err, items) {

            if (err || !Array.isArray(items)) {

                sendJSON(res, 500, {

                    error: "Не удалось прочитать данные"

                });

                return;

            }

            const item = items.find(function (record) {

                return Number(record.id) === id;

            });

            if (!item) {

                sendJSON(res, 404, {

                    error: "Пластинка не найдена"

                });

                return;

            }

            sendJSON(res, 200, item);

        });

        return;

    }

    // Неизвестный маршрут

    sendJSON(res, 404, {

        error: "Маршрут не найден"

    });

});

server.listen(PORT, function () {

    console.log("Сервер запущен: http://localhost:" + PORT);

});