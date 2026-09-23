extends Node2D

@export var ball_scene: PackedScene

@onready var levels: Node2D = $Levels
@onready var ball_layer: Node2D = $BallLayer
@onready var spawn_point: Marker2D = $SpawnPoint
@onready var aim_line: Line2D = $AimLine
@onready var hud: CanvasLayer = $HUD
@onready var camera: Camera2D = $Camera2D

enum State { AIMING, RESOLVING, GAME_OVER }

const SHOTS_PER_LEVEL := [3, 4, 4]
const LAUNCH_SPEED := 980.0

var level_index := 0
var shots_left := 0
var targets_remaining := 0
var targets_total := 0
var active_balls: Array = []
var state := State.AIMING
var current_level: Node2D
var level_cleared := false


func _ready() -> void:
	camera.make_current()
	_prepare_level(0)


func _process(_delta: float) -> void:
	if state == State.AIMING and active_balls.is_empty():
		var direction := get_global_mouse_position() - spawn_point.global_position
		if direction.length() > 12.0:
			aim_line.visible = true
			aim_line.points = PackedVector2Array([spawn_point.global_position, get_global_mouse_position()])
		else:
			aim_line.visible = false
	else:
		aim_line.visible = false


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_launch_ball()
	elif event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_R and state == State.GAME_OVER:
		get_tree().reload_current_scene()


func _prepare_level(index: int) -> void:
	level_index = index
	for level in levels.get_children():
		level.visible = false
		level.process_mode = Node.PROCESS_MODE_DISABLED

	current_level = levels.get_child(index)
	current_level.visible = true
	current_level.process_mode = Node.PROCESS_MODE_INHERIT

	for ball in active_balls:
		ball.queue_free()
	active_balls.clear()
	level_cleared = false

	var target_container: Node2D = current_level.get_node("Targets")
	targets_total = target_container.get_child_count()
	targets_remaining = targets_total
	for target in target_container.get_children():
		target.destroyed.connect(_on_target_destroyed)

	if current_level.has_node("Splitters"):
		for splitter in current_level.get_node("Splitters").get_children():
			splitter.reset_state()
			splitter.split_requested.connect(_on_split_requested)

	shots_left = SHOTS_PER_LEVEL[index]
	state = State.AIMING
	hud.set_targets(targets_remaining, targets_total)
	hud.set_shots(shots_left, SHOTS_PER_LEVEL[index])
	hud.play_transition()


func _launch_ball() -> void:
	if state != State.AIMING or not active_balls.is_empty() or shots_left <= 0 or ball_scene == null:
		return
	var direction := get_global_mouse_position() - spawn_point.global_position
	if direction.length() <= 12.0:
		return
	_spawn_ball(spawn_point.global_position, direction.normalized() * LAUNCH_SPEED, true)
	shots_left -= 1
	state = State.RESOLVING
	aim_line.visible = false
	hud.set_shots(shots_left, SHOTS_PER_LEVEL[level_index])


func _spawn_ball(position: Vector2, velocity: Vector2, can_split: bool) -> void:
	var ball: RigidBody2D = ball_scene.instantiate()
	ball_layer.add_child(ball)
	ball.global_position = position
	ball.can_split = can_split
	ball.launch(velocity)
	ball.finished.connect(_on_ball_finished)
	active_balls.append(ball)


func _on_split_requested(ball: RigidBody2D) -> void:
	if not is_instance_valid(ball) or not ball.can_split:
		return
	ball.can_split = false
	var speed := ball.linear_velocity.length()
	if speed < 1.0:
		return
	var direction := ball.linear_velocity.normalized()
	_spawn_ball(ball.global_position, direction.rotated(deg_to_rad(-24.0)) * speed, false)
	_spawn_ball(ball.global_position, direction.rotated(deg_to_rad(24.0)) * speed, false)


func _on_ball_finished(ball: RigidBody2D) -> void:
	active_balls.erase(ball)
	ball.queue_free()
	if not active_balls.is_empty():
		return

	if level_cleared:
		_advance_level()
	elif targets_remaining <= 0:
		level_cleared = true
		_advance_level()
	elif shots_left <= 0:
		_finish_round(false)
	else:
		state = State.AIMING


func _on_target_destroyed(_target: Area2D) -> void:
	targets_remaining = maxi(targets_remaining - 1, 0)
	hud.set_targets(targets_remaining, targets_total)
	_shake_camera(7.0)
	if targets_remaining <= 0:
		level_cleared = true
		if active_balls.is_empty():
			_advance_level()


func _advance_level() -> void:
	if level_index + 1 >= levels.get_child_count():
		_finish_round(true)
	else:
		_prepare_level(level_index + 1)


func _shake_camera(strength: float) -> void:
	camera.offset = Vector2(rng_range(-strength, strength), rng_range(-strength, strength))
	var tween := create_tween()
	tween.tween_property(camera, "offset", Vector2.ZERO, 0.16)


func _finish_round(won: bool) -> void:
	state = State.GAME_OVER
	aim_line.visible = false
	for ball in active_balls:
		if is_instance_valid(ball):
			ball.freeze = true
	hud.show_result(won)


func rng_range(minimum: float, maximum: float) -> float:
	return randf_range(minimum, maximum)