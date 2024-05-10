// const { Type, Team, Pokemon, conn } = require('../db')
// const axios = require('axios')
// const {API_URL} = process.env

// const addTeam = async (req, res) => {
//     try {
//         const { id, teamId } = req.body
//         if (!id) {
//             throw Error('Id Vacio!')
//         }
//         if (!teamId) {
//             throw Error('Necesitas loguearte para agregar un pokemon a tu euipo!')
//         }
//         const team = await Team.findByPk(teamId)
//         if (!team) {
//             throw Error('El equipo no existe!')
//         }
//         const teamCheck = await conn.models.pokemon_team.findAll({ where: { teamId: teamId } })
//         if (teamCheck.length === 5) throw Error('Equipo lleno!')
//         let dBpokemon = await Pokemon.findOne({ where: { pokeId: id } })
//         if (dBpokemon) {
//             console.log(`Pokemon ${dBpokemon.name} encontrado`)
//             const pokemonCheck = await conn.models.pokemon_team.findAll({ where: { pokemonId: dBpokemon.id, teamId: teamId } })
//             if (pokemonCheck.length !== 0) throw Error('El pokemon ya esta en el equipo!')
//             await team.addPokemon(dBpokemon)
//             return res.status(200).send({ message: `El Pokemon con id: ${id} agregado al equipo desde la DB!` })
//         }
//         const { data } = await axios(`${API_URL}/${id}`)
//         if (!data) throw Error('Pokemon no encontrado en API')
//         const type1 = data.types[0] && await Type.findOne({ where: { name: data.types[0].type.name } })
//         const type2 = data.types[1] && await Type.findOne({ where: { name: data.types[1].type.name } })
//         const pokemon = {
//             pokeId: data.id,
//             name: data.name,
//             image: data.sprites.other['official-artwork'].front_default,
//             hp: data.stats[0].base_stat,
//             attack: data.stats[1].base_stat,
//             defense: data.stats[2].base_stat,
//             speed: data.stats[5].base_stat,
//             height: data.height,
//             weight: data.weight,
//             isInDb: false,
//         }
//         const createdPokemon = await Pokemon.create(pokemon)
//         await createdPokemon.addType(type1)
//         type2 && await createdPokemon.addType(type2)
//         const pokemonCheck = await conn.models.pokemon_team.findAll({ where: { pokemonId: createdPokemon.id } })
//         if (pokemonCheck.length > 0) throw Error('El pokemon ya esta en el equipo!')
//         await team.addPokemon(createdPokemon)
//         return res.status(200).send({ message: `El Pokemon con id: ${id} agregado al equipo desde la API` })
//     } catch (error) {
//         return res.status(400).send(error.message)
//     }

// }

// module.exports = { addTeam }