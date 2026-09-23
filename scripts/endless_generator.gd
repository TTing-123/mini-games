extends Node2D

@export var target_scene: PackedScene
@export var bumper_scene: PackedScene
@export var gravity_scene: PackedScene
@export var splitter_scene: PackedScene
@export var charger_scene: PackedScene

@onready var layout: Node2D = $Layout

var rng := RandomNumberGenerator.new()
var placed_positions: Array[Vector2] = []


func generate(level_number: int) -> Dictionary:
	for child in layout.get_children():
		child.visible = false
		child.queue_free()
	placed_positions.clear()
	rng.seed = int(Time.get_unix_time_from_system()) + level_number * 7919

	var target_count := mini(3 + int((level_number - 1) / 2.0), 7)
	var bumper_count := mini(3 + int(level_number / 2.0), 7)
	var gravity_count := 0
	var splitter_count := 0
	var charger_count := 0
	if level_number >= 2:
		gravity_count = mini(1 + int((level_number - 2) / 4.0), 2)
	if level_number >= 3:
		splitter_count = mini(1 + int((level_number - 3) / 4.0), 2)
	if level_number >= 4:
		charger_count = 1

	var targets := _spawn_many(target_scene, target_count, Vector2(100, 110), Vector2(1180, 420), 140.0)
	var bumpers := _spawn_many(bumper_scene, bumper_count, Vector2(100, 180), Vector2(1180, 600), 110.0)
	var gravities := _spawn_many(gravity_scene, gravity_count, Vector2(220, 250), Vector2(1060, 520), 220.0)
	var splitters := _spawn_many(splitter_scene, splitter_count, Vector2(120, 360), Vector2(1160, 610), 150.0)
	var chargers := _spawn_many(charger_scene, charger_count, Vector2(160, 360), Vector2(1120, 600), 150.0)

	return {
		"targets": targets,
		"bumpers": bumpers,
		"gravities": gravities,
		"splitters": splitters,
		"chargers": chargers,
	}


func _spawn_many(scene: PackedScene, count: int, min_position: Vector2, max_position: Vector2, minimum_distance: float) -> Array:
	var result := []
	if scene == null:
		return result
	for i in range(count):
		var position := _find_position(min_position, max_position, minimum_distance)
		var instance: Node2D = scene.instantiate()
		layout.add_child(instance)
		instance.position = position
		result.append(instance)
	return result


func _find_position(min_position: Vector2, max_position: Vector2, minimum_distance: float) -> Vector2:
	for attempt in range(120):
		var candidate := Vector2(
			rng.randf_range(min_position.x, max_position.x),
			rng.randf_range(min_position.y, max_position.y)
		)
		if candidate.distance_to(Vector2(640.0, 620.0)) < 180.0:
			continue
		var valid := true
		for placed in placed_positions:
			if candidate.distance_to(placed) < minimum_distance:
				valid = false
				break
		if valid:
			placed_positions.append(candidate)
			return candidate
	var fallback := Vector2(
		rng.randf_range(min_position.x, max_position.x),
		rng.randf_range(min_position.y, max_position.y)
	)
	placed_positions.append(fallback)
	return fallback