extends RigidBody2D

signal finished(ball: RigidBody2D)

@export var max_lifetime := 6.0
@export var min_speed := 32.0
@export var settle_time := 0.8

@onready var trail: Line2D = $Trail

var elapsed := 0.0
var settled_for := 0.0
var finished_emitted := false


func launch(initial_velocity: Vector2) -> void:
	linear_velocity = initial_velocity
	trail.clear_points()


func _physics_process(delta: float) -> void:
	if finished_emitted:
		return

	elapsed += delta
	trail.add_point(global_position)
	if trail.get_point_count() > 100:
		trail.remove_point(0)

	if linear_velocity.length() < min_speed:
		settled_for += delta
	else:
		settled_for = 0.0

	if elapsed >= max_lifetime or settled_for >= settle_time:
		finished_emitted = true
		emit_signal("finished", self)


func force_finish() -> void:
	if not finished_emitted:
		finished_emitted = true
		emit_signal("finished", self)