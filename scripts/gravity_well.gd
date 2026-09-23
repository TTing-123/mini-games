extends Area2D

@export var strength := 2600.0
@export var max_radius := 240.0
@export var glow_base_scale := 1.263

@onready var glow: Polygon2D = $Glow
@onready var tether: Line2D = $Tether


func _physics_process(_delta: float) -> void:
	var pulse := 1.0 + sin(Time.get_ticks_msec() * 0.003) * 0.04
	glow.scale = Vector2.ONE * glow_base_scale * pulse

	var strongest_body: RigidBody2D = null
	var strongest_force := 0.0
	for body in get_overlapping_bodies():
		if not (body is RigidBody2D):
			continue
		var force := get_pull_force_at(body.global_position)
		body.apply_central_force(force)
		if force.length() > strongest_force:
			strongest_force = force.length()
			strongest_body = body

	if strongest_body != null:
		tether.visible = true
		tether.points = PackedVector2Array([global_position, strongest_body.global_position])
	else:
		tether.visible = false


func get_pull_force_at(point: Vector2) -> Vector2:
	var offset := global_position - point
	var distance := maxf(offset.length(), 48.0)
	var falloff := clampf(1.0 - distance / max_radius, 0.25, 1.0)
	return offset.normalized() * strength * falloff