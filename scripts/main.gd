extends Node2D

@export var ball_scene: PackedScene

@onready var targets: Node2D = $Targets
@onready var ball_layer: Node2D = $BallLayer
@onready var spawn_point: Marker2D = $SpawnPoint
@onready var aim_line: Line2D = $AimLine
@onready var hud: CanvasLayer = $HUD

enum State { AIMING, RESOLVING, GAME_OVER }

const MAX_SHOTS := 3
const LAUNCH_SPEED := 980.0

var shots_left := MAX_SHOTS
var targets_remaining := 0
var active_ball: RigidBody2D = null
var state := State.AIMING


func _ready() -> void:
	for child in targets.get_children():
		targets_remaining += 1
		child.destroyed.connect(_on_target_destroyed)
	hud.set_targets(targets_remaining, targets_remaining)
	hud.set_shots(shots_left, MAX_SHOTS)


func _process(_delta: float) -> void:
	if state == State.AIMING and active_ball == null:
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


func _launch_ball() -> void:
	if state != State.AIMING or active_ball != null or shots_left <= 0 or ball_scene == null:
		return

	var direction := get_global_mouse_position() - spawn_point.global_position
	if direction.length() <= 12.0:
		return
	direction = direction.normalized()

	var ball: RigidBody2D = ball_scene.instantiate()
	ball_layer.add_child(ball)
	ball.global_position = spawn_point.global_position
	ball.launch(direction * LAUNCH_SPEED)
	ball.finished.connect(_on_ball_finished)
	active_ball = ball

	shots_left -= 1
	state = State.RESOLVING
	aim_line.visible = false
	hud.set_shots(shots_left, MAX_SHOTS)


func _on_ball_finished(ball: RigidBody2D) -> void:
	if ball != active_ball:
		return
	active_ball = null
	ball.queue_free()

	if targets_remaining <= 0:
		_finish_round(true)
	elif shots_left <= 0:
		_finish_round(false)
	else:
		state = State.AIMING


func _on_target_destroyed(_target: Area2D) -> void:
	targets_remaining = maxi(targets_remaining - 1, 0)
	hud.set_targets(targets_remaining, 3)
	if targets_remaining <= 0:
		_finish_round(true)


func _finish_round(won: bool) -> void:
	state = State.GAME_OVER
	aim_line.visible = false
	hud.show_result(won)