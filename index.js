const express = require("express");
var morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(express.static('build'))
app.use(express.json());
app.use(cors());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
	morgan(
		":method :url :status :res[content-length] - :response-time ms - :body",
		{
			skip: (req, res) => !(req.method === "POST"),
		}
	)
);
app.use(
	morgan("tiny", {
		skip: (req, res) => req.method === "POST",
	})
);

let persons = [
	{
		name: "Arto Hellasko",
		number: "040-123456",
		id: 1,
	},
	{
		name: "Ada Lovelace",
		number: "39-44-5323523",
		id: 2,
	},
	{
		name: "Dan Abramov",
		number: "12-43-234345",
		id: 3,
	},
	{
		name: "Mary Poppendiecks",
		number: "39-23-6423122",
		id: 4,
	},
	{
		name: "Delete me",
		number: "1111",
		id: 10,
	},
];

const generateId = () => {
	return Math.floor(Math.random() * 100000);
};

app.get("/", (request, response) => {
	response.send("<h1>Hello World!</h1>");
});

app.get("/info", (request, response) => {
	const message = `Phonebook has info for ${persons.length} people`;
	const time = new Date().toString();
	response.send(`<p>${message}</p><p>${time}</p>`);
});

app.get("/api/persons", (request, response) => {
	response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find((person) => person.id === id);
	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.delete("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	const newPersons = persons.filter((person) => person.id !== id);
	persons = newPersons;
	response.json(`Succesfully deleted ${id}`);
});

app.post("/api/persons", (request, response) => {
	const names = persons.map((person) => person.name);
	const body = request.body;

	if (!body.name) {
		return response.status(400).json({
			error: "Name missing",
		});
	}
	if (!body.number) {
		return response.status(400).json({
			error: "Number missing",
		});
	}
	if (names.includes(body.name)) {
		return response.status(400).json({
			error: "Name must be unique",
		});
	}

	const person = {
		name: body.name,
		number: body.number,
		id: generateId(),
	};
	persons = persons.concat(person);
	response.json(person);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

process
	.on("exit", (code) => {
		nodemon.emit("quit");
		process.exit(code);
	})
	.on("SIGINT", () => {
		nodemon.emit("quit");
		process.exit(0);
	});
